import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { buildInvoicePdf } from '@/lib/invoice-pdf';

const LOGO_PATH = join(process.cwd(), 'public', 'assets', 'images', 'app_logo.png');

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { sale: { include: { items: true, payments: true } } },
  });
  if (!invoice || !invoice.sale) {
    return new Response('Invoice not found', { status: 404 });
  }

  const sale = invoice.sale;
  const amountPaid = sale.payments.reduce((sum, payment) => sum + payment.amount.toNumber(), 0);
  const logo = new Uint8Array(await readFile(LOGO_PATH));
  const bytes = await buildInvoicePdf(
    {
      invoiceNumber: invoice.number,
      status: invoice.status,
      paymentStatus: sale.paymentStatus as 'paid' | 'credit' | 'prospect',
      amountPaid:
        sale.payments.length > 0
          ? Math.round((amountPaid + Number.EPSILON) * 100) / 100
          : undefined,
      customerName: sale.customerName,
      customerContact: sale.customerContact,
      customerEmail: sale.customerEmail,
      notes: sale.notes,
      createdAt: invoice.createdAt,
      subtotal: sale.subtotal.toNumber(),
      taxRate: sale.taxRate.toNumber(),
      tax: sale.tax.toNumber(),
      total: sale.total.toNumber(),
      items: sale.items.map((item) => ({
        name: item.variantLabel ? `${item.name} (${item.variantLabel})` : item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toNumber(),
        total: item.total.toNumber(),
      })),
    },
    logo
  );

  const number = String(invoice.number).padStart(4, '0');
  return new Response(bytes as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Olivoria-Organics-Invoice-${number}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
