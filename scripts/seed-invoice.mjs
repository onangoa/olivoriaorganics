// Recreates the "Herbal teas and supplements" prospect invoice (Walk-in
// Customer, 28 line items, KSh 43,650) on a fresh database. The seed files
// carry the catalogue but not sales/invoices — run this after db:seed when
// the invoice is needed on a new environment (e.g. a new VPS).
//
// Mirrors createSale() in src/app/admin/sale-actions.ts for a prospect:
// pending invoice, stock untouched, no payment recorded.
//
// Idempotent: skips if a matching sale already exists (same customer+notes).
// Usage:
//   npm run db:seed-invoice              create (or skip if already present)
//   npm run db:seed-invoice -- --dry-run  simulate the creation, then roll back
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const kes = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const CUSTOMER = 'Walk-in Customer';
const NOTES = 'Herbal teas and supplements.';
const DRY_RUN_MARKER = '__SEED_INVOICE_DRY_RUN_ROLLBACK__';

// productId -> variant label (null for single-size products), quantity, unit price.
const ITEMS = [
  { productId: 'oral-gut-cleanser', variantLabel: null, quantity: 1, unitPrice: 650 },
  { productId: 'probiotics', variantLabel: null, quantity: 1, unitPrice: 2450 },
  { productId: 'inulin', variantLabel: '100g', quantity: 1, unitPrice: 1200 },
  { productId: 'immune-formula', variantLabel: '200g', quantity: 1, unitPrice: 2800 },
  { productId: 'liver-formula', variantLabel: '200g', quantity: 1, unitPrice: 2450 },
  { productId: 'edema-formula', variantLabel: '200g', quantity: 1, unitPrice: 2600 },
  {
    productId: 'curcumin-bee-propolis-formula',
    variantLabel: '100g',
    quantity: 1,
    unitPrice: 1350,
  },
  { productId: 'silymarin-capsules', variantLabel: '90 caps', quantity: 1, unitPrice: 1350 },
  { productId: 'zinc-capsules', variantLabel: '30 caps', quantity: 1, unitPrice: 600 },
  { productId: 'hypodea', variantLabel: '500ml', quantity: 1, unitPrice: 2400 },
  { productId: 'epsom-salt', variantLabel: '1kg', quantity: 1, unitPrice: 450 },
  { productId: 'clove-essential-oil', variantLabel: '30ml', quantity: 1, unitPrice: 800 },
  { productId: 'dmso', variantLabel: '500ml', quantity: 1, unitPrice: 5300 },
  { productId: 'green-power', variantLabel: '200g', quantity: 1, unitPrice: 2000 },
  { productId: 'goldenseal-plus', variantLabel: '200g', quantity: 1, unitPrice: 2400 },
  { productId: 'molasses', variantLabel: null, quantity: 1, unitPrice: 650 },
  { productId: 'caregiver-charges-4-sessions', variantLabel: null, quantity: 1, unitPrice: 4800 },
  { productId: 'enema-kits-4-sessions', variantLabel: null, quantity: 1, unitPrice: 1600 },
  { productId: 'full-body-scrubbing', variantLabel: null, quantity: 1, unitPrice: 0 },
  { productId: 'fresh-coconuts', variantLabel: null, quantity: 10, unitPrice: 75 },
  { productId: 'red-palm-oil', variantLabel: null, quantity: 1, unitPrice: 1200 },
  { productId: 'frankincense-essential-oil', variantLabel: '30ml', quantity: 1, unitPrice: 2500 },
  { productId: 'gloves', variantLabel: null, quantity: 1, unitPrice: 650 },
  { productId: 'flaxseeds', variantLabel: null, quantity: 1, unitPrice: 600 },
  { productId: 'castor-oil', variantLabel: null, quantity: 1, unitPrice: 1200 },
  { productId: 'baobab-fruit-powder', variantLabel: null, quantity: 1, unitPrice: 300 },
  { productId: 'turmeric', variantLabel: null, quantity: 1, unitPrice: 200 },
  { productId: 'basil-seeds', variantLabel: null, quantity: 1, unitPrice: 400 },
];

const dryRun = process.argv.includes('--dry-run');

async function buildLineItems() {
  const products = await prisma.product.findMany({
    where: { id: { in: ITEMS.map((item) => item.productId) } },
    include: { variants: { orderBy: { position: 'asc' } } },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));

  for (const item of ITEMS) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`Product "${item.productId}" not found — run "npm run db:seed" first.`);
    }
    if (item.variantLabel) {
      const variant = product.variants.find((v) => v.label === item.variantLabel);
      if (!variant) {
        throw new Error(
          `Variant "${item.variantLabel}" not found for "${product.name}" (has: ${product.variants
            .map((v) => v.label)
            .join(', ')}).`
        );
      }
      if (variant.price.toNumber() !== item.unitPrice) {
        console.warn(
          `NOTE: ${product.name} (${item.variantLabel}) catalog price ${variant.price} != invoice price ${item.unitPrice}.`
        );
      }
    }
  }

  const lineItems = ITEMS.map((item) => {
    const product = productMap.get(item.productId);
    return {
      productId: item.productId,
      name: product.name,
      variantLabel: item.variantLabel,
      unitPrice: round2(item.unitPrice),
      quantity: item.quantity,
      total: round2(item.unitPrice * item.quantity),
    };
  });

  const subtotal = round2(lineItems.reduce((sum, item) => sum + item.total, 0));
  return { lineItems, subtotal, tax: 0, total: subtotal };
}

async function createInvoice(tx, { lineItems, subtotal, tax, total }) {
  const sale = await tx.sale.create({
    data: {
      customerName: CUSTOMER,
      paymentStatus: 'prospect',
      subtotal,
      taxRate: 0,
      tax,
      total,
      notes: NOTES,
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
    data: { saleId: sale.id, status: 'pending' },
  });

  await tx.activityLog.create({
    data: {
      action: 'sale.create',
      entity: 'Sale',
      entityId: sale.id,
      message: `Recorded a prospect sale for "${CUSTOMER}" — ${kes.format(total)} (invoice #${String(invoice.number).padStart(4, '0')}, pending).`,
      userEmail: process.env.ADMIN_EMAIL || 'admin@olivoriaorganics.com',
    },
  });

  return { sale, invoice };
}

function printSummary(lineItems, subtotal, total) {
  for (const item of lineItems) {
    console.log(
      `  - ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ''} x${item.quantity} @ ${kes.format(item.unitPrice)} = ${kes.format(item.total)}`
    );
  }
  console.log(
    `Subtotal: ${kes.format(subtotal)} | Tax: ${kes.format(0)} | Total: ${kes.format(total)}`
  );
}

async function main() {
  const existing = await prisma.sale.findFirst({
    where: { customerName: CUSTOMER, notes: NOTES },
    include: { invoice: true, items: true },
  });
  if (existing) {
    const number = existing.invoice
      ? `#${String(existing.invoice.number).padStart(4, '0')}`
      : '(no invoice row)';
    console.log(
      `Invoice ${number} for "${CUSTOMER}" — ${NOTES} is already present (${existing.items.length} items, ${kes.format(existing.total.toNumber())}). Nothing to do.`
    );
    return;
  }

  const totals = await buildLineItems();

  if (dryRun) {
    try {
      await prisma.$transaction(async (tx) => {
        await createInvoice(tx, totals);
        throw new Error(DRY_RUN_MARKER);
      });
    } catch (err) {
      if (err.message !== DRY_RUN_MARKER) throw err;
    }
    console.log('Dry run OK — rolled back. Would create a pending prospect invoice:');
    printSummary(totals.lineItems, totals.subtotal, totals.total);
    return;
  }

  const { invoice } = await prisma.$transaction((tx) => createInvoice(tx, totals));
  console.log(
    `Invoice #${String(invoice.number).padStart(4, '0')} created (status: ${invoice.status}, customer: ${CUSTOMER}, prospect).`
  );
  printSummary(totals.lineItems, totals.subtotal, totals.total);
  console.log(
    'Stock untouched (pending invoice). Complete it from /admin/invoices to reduce stock.'
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
