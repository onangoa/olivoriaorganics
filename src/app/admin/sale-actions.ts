'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/activity';
import { formatKES } from '@/lib/money';

export type PaymentStatus = 'paid' | 'credit' | 'prospect';

const PAYMENT_STATUSES: PaymentStatus[] = ['paid', 'credit', 'prospect'];

export interface SaleItemInput {
  productId: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
}

export interface SaleInput {
  customerName: string;
  customerContact?: string;
  customerEmail?: string;
  paymentStatus: PaymentStatus;
  taxRate?: number;
  notes?: string;
  items: SaleItemInput[];
}

export type SaleActionResult =
  | {
      ok: true;
      id: string;
      invoiceId: string;
      invoiceNumber: number;
      invoiceStatus: 'pending' | 'completed';
    }
  | { ok: false; error: string };

export type PaymentActionResult = { ok: true; fullyPaid: boolean } | { ok: false; error: string };

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

async function requireSession(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');
  return session.user.email ?? 'unknown user';
}

function revalidateSalePages() {
  revalidatePath('/admin/sales');
  revalidatePath('/admin/pos');
  revalidatePath('/admin/invoices');
  revalidatePath('/admin/stock');
  revalidatePath('/admin/products');
  revalidatePath('/products');
}

interface StockItemRow {
  productId: string | null;
  name: string;
  variantLabel: string | null;
  quantity: number;
}

async function reduceStockForItems(
  tx: Prisma.TransactionClient,
  items: StockItemRow[],
  invoice: { id: string; number: number }
) {
  // Services (bookable sessions) don't carry stock — never reduce or block on them.
  const trackedItems = items.filter(
    (item): item is StockItemRow & { productId: string } => item.productId !== null
  );
  const serviceRows = await tx.product.findMany({
    where: { id: { in: trackedItems.map((item) => item.productId) }, type: 'service' },
    select: { id: true },
  });
  const serviceIds = new Set(serviceRows.map((row) => row.id));

  for (const item of trackedItems) {
    if (serviceIds.has(item.productId)) continue;
    const updated = await tx.product.updateMany({
      where: { id: item.productId, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    });
    if (updated.count === 0) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      throw new Error(
        `Insufficient stock for "${product?.name ?? item.name}" — available: ${product?.stock ?? 0}.`
      );
    }
  }

  for (const item of trackedItems) {
    if (serviceIds.has(item.productId)) continue;
    await tx.stockMovement.create({
      data: {
        productId: item.productId,
        delta: -item.quantity,
        reason: 'sale',
        note: `Invoice #${String(invoice.number).padStart(4, '0')}${item.variantLabel ? ` (${item.variantLabel})` : ''}`,
        invoiceId: invoice.id,
      },
    });
    await tx.product.updateMany({
      where: { id: item.productId, stock: { lte: 0 } },
      data: { availability: 'Out of Stock' },
    });
  }
}

export async function createSale(input: SaleInput): Promise<SaleActionResult> {
  try {
    const userEmail = await requireSession();

    if (!input.customerName?.trim()) return { ok: false, error: 'Customer name is required.' };
    if (!PAYMENT_STATUSES.includes(input.paymentStatus)) {
      return { ok: false, error: 'Payment status must be "paid", "credit" or "prospect".' };
    }
    if (!Array.isArray(input.items) || input.items.length === 0) {
      return { ok: false, error: 'Add at least one product to the sale.' };
    }

    const grouped = new Map<
      string,
      { quantity: number; unitPrice: number; variantLabel: string | null }
    >();
    for (const item of input.items) {
      if (!item.productId?.trim())
        return { ok: false, error: 'A line item has no product selected.' };
      const quantity = Math.floor(Number(item.quantity));
      if (!Number.isFinite(quantity) || quantity < 1) {
        return { ok: false, error: 'Each item quantity must be at least 1.' };
      }
      const unitPrice = round2(Number(item.unitPrice));
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return { ok: false, error: 'Unit prices must be zero or more.' };
      }
      const label = item.variantLabel?.trim() || null;
      const key = `${item.productId}::${label ?? ''}`;
      const existing = grouped.get(key);
      if (existing) existing.quantity += quantity;
      else grouped.set(key, { quantity, unitPrice, variantLabel: label });
    }

    const productIds = [...new Set([...grouped.keys()].map((key) => key.split('::')[0]))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });
    const productMap = new Map(products.map((product) => [product.id, product]));

    for (const productId of productIds) {
      if (!productMap.has(productId)) {
        return { ok: false, error: `Product "${productId}" no longer exists.` };
      }
    }

    const taxRate = round2(Math.max(0, Math.min(100, Number(input.taxRate) || 0)));
    const lineItems = [...grouped.entries()].map(([key, item]) => {
      const productId = key.split('::')[0];
      const product = productMap.get(productId)!;
      return {
        productId,
        name: product.name,
        variantLabel: item.variantLabel,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        total: round2(item.unitPrice * item.quantity),
      };
    });

    const subtotal = round2(lineItems.reduce((sum, item) => sum + item.total, 0));
    const tax = round2((subtotal * taxRate) / 100);
    const total = round2(subtotal + tax);

    const isProspect = input.paymentStatus === 'prospect';

    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          customerName: input.customerName.trim(),
          customerContact: input.customerContact?.trim() || null,
          customerEmail: input.customerEmail?.trim() || null,
          paymentStatus: input.paymentStatus,
          subtotal,
          taxRate,
          tax,
          total,
          notes: input.notes?.trim() || null,
          items: {
            create: lineItems.map((item) => ({
              productId: item.productId,
              name: item.name,
              variantLabel: item.variantLabel,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              total: item.total,
            })),
          },
        },
      });

      const invoice = await tx.invoice.create({
        data: isProspect
          ? { saleId: sale.id, status: 'pending' }
          : { saleId: sale.id, status: 'completed', completedAt: new Date() },
      });

      if (!isProspect) {
        await reduceStockForItems(tx, lineItems, invoice);
      }

      if (input.paymentStatus === 'paid') {
        await tx.payment.create({
          data: { saleId: sale.id, amount: total, note: 'Paid in full at sale' },
        });
      }

      return { sale, invoice };
    });

    await logActivity({
      action: 'sale.create',
      entity: 'Sale',
      entityId: result.sale.id,
      message: `Recorded a ${input.paymentStatus} sale for "${result.sale.customerName}" — ${formatKES(total)} (invoice #${String(result.invoice.number).padStart(4, '0')}, ${isProspect ? 'pending' : 'completed'}).`,
      userEmail,
    });
    revalidateSalePages();
    return {
      ok: true,
      id: result.sale.id,
      invoiceId: result.invoice.id,
      invoiceNumber: result.invoice.number,
      invoiceStatus: isProspect ? 'pending' : 'completed',
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Failed to record sale.' };
  }
}

export async function completeInvoice(
  invoiceId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userEmail = await requireSession();

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { sale: { include: { items: true } } },
    });
    if (!invoice) return { ok: false, error: 'Invoice not found.' };
    if (invoice.status === 'completed') {
      return { ok: false, error: 'Invoice is already completed.' };
    }

    await prisma.$transaction(async (tx) => {
      await reduceStockForItems(tx, invoice.sale.items, invoice);

      if (invoice.sale.paymentStatus === 'prospect') {
        await tx.sale.update({
          where: { id: invoice.saleId },
          data: { paymentStatus: 'credit' },
        });
      }

      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: 'completed', completedAt: new Date() },
      });
    });

    await logActivity({
      action: 'invoice.complete',
      entity: 'Invoice',
      entityId: invoice.id,
      message: `Completed invoice #${String(invoice.number).padStart(4, '0')} for "${invoice.sale.customerName}" — ${formatKES(invoice.sale.total.toNumber())}. Stock reduced.`,
      userEmail,
    });
    revalidateSalePages();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to complete invoice.',
    };
  }
}

export async function recordPayment(
  saleId: string,
  amount: number,
  note?: string
): Promise<PaymentActionResult> {
  try {
    const userEmail = await requireSession();

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { payments: true },
    });
    if (!sale) return { ok: false, error: 'Sale not found.' };
    if (sale.paymentStatus === 'prospect') {
      return {
        ok: false,
        error: 'This sale is still a prospect — complete its invoice before recording payments.',
      };
    }
    if (sale.paymentStatus === 'paid') {
      return { ok: false, error: 'This sale is already fully paid.' };
    }

    const total = sale.total.toNumber();
    const paidSoFar = round2(
      sale.payments.reduce((sum, payment) => sum + payment.amount.toNumber(), 0)
    );
    const remaining = round2(total - paidSoFar);

    const value = round2(Number(amount));
    if (!Number.isFinite(value) || value <= 0) {
      return { ok: false, error: 'Payment amount must be greater than zero.' };
    }
    if (value > remaining + 0.001) {
      return {
        ok: false,
        error: `Payment exceeds the remaining balance of ${formatKES(remaining)}.`,
      };
    }

    const fullyPaid = paidSoFar + value >= total - 0.001;

    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: { saleId: sale.id, amount: value, note: note?.trim() || null },
      });
      if (fullyPaid) {
        await tx.sale.update({
          where: { id: sale.id },
          data: { paymentStatus: 'paid' },
        });
      }
    });

    await logActivity({
      action: 'payment.record',
      entity: 'Payment',
      entityId: sale.id,
      message: `Recorded a payment of ${formatKES(value)} for "${sale.customerName}"${fullyPaid ? ' — sale fully paid' : ` (${formatKES(remaining - value)} remaining)`}.`,
      userEmail,
    });
    revalidateSalePages();
    return { ok: true, fullyPaid };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to record payment.',
    };
  }
}

export async function deleteSale(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userEmail = await requireSession();

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { invoice: true, items: true },
    });
    if (!sale) return { ok: false, error: 'Sale not found.' };

    // Services don't carry stock — only restore physical goods.
    const itemProductIds = sale.items
      .map((item) => item.productId)
      .filter((productId): productId is string => Boolean(productId));
    const serviceRows = itemProductIds.length
      ? await prisma.product.findMany({
          where: { id: { in: itemProductIds }, type: 'service' },
          select: { id: true },
        })
      : [];
    const serviceIds = new Set(serviceRows.map((row) => row.id));

    await prisma.$transaction(async (tx) => {
      if (sale.invoice?.status === 'completed') {
        for (const item of sale.items) {
          if (!item.productId || serviceIds.has(item.productId)) continue;
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              delta: item.quantity,
              reason: 'sale-reversal',
              note: `Invoice #${String(sale.invoice.number).padStart(4, '0')} deleted — stock restored`,
            },
          });
          await tx.product.updateMany({
            where: { id: item.productId, stock: { gt: 0 }, availability: 'Out of Stock' },
            data: { availability: 'In Stock' },
          });
        }
      }
      await tx.invoice.deleteMany({ where: { saleId: sale.id } });
      await tx.sale.delete({ where: { id: sale.id } });
    });

    await logActivity({
      action: 'sale.delete',
      entity: 'Sale',
      entityId: sale.id,
      message: `Deleted ${sale.paymentStatus} sale for "${sale.customerName}" — ${formatKES(sale.total.toNumber())}${sale.invoice ? ` (invoice #${String(sale.invoice.number).padStart(4, '0')}, stock restored)` : ''}.`,
      userEmail,
    });
    revalidateSalePages();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Failed to delete sale.' };
  }
}
