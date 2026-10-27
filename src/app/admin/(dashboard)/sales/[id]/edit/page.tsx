import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import SalesPos, { type PosProduct } from '@/app/admin/components/SalesPos';
import type { Metadata } from 'next';

interface EditSalePageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Edit Sale — Olivoria Organics Admin',
};

export default async function EditSalePage({ params }: EditSalePageProps) {
  const { id } = await params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { invoice: true, items: true },
  });
  if (!sale) notFound();

  const invoice = sale.invoice;
  const editable = sale.paymentStatus === 'prospect' && invoice && invoice.status === 'pending';

  if (!editable) {
    return (
      <div className="text-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border">
        <p className="text-base font-serif italic">This sale can no longer be edited.</p>
        <p className="mt-2 text-sm">
          Only prospect sales with a pending invoice can be edited — this one is already confirmed
          (paid or on credit).
        </p>
        <Link
          href="/admin/sales"
          className="mt-4 inline-block text-primary underline text-sm font-semibold"
        >
          Back to Sales
        </Link>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      type: true,
      stock: true,
      availability: true,
      image: true,
      variants: { orderBy: { position: 'asc' }, select: { label: true, price: true } },
    },
    orderBy: { name: 'asc' },
  });

  const posProducts: PosProduct[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    type: product.type === 'service' ? 'service' : 'physical',
    stock: product.stock,
    availability: product.availability,
    image: product.image,
    variants: product.variants.map((variant) => ({
      label: variant.label,
      price: variant.price.toNumber(),
    })),
  }));

  return (
    <div>
      <div className="mb-8">
        <span className="section-label">Sales</span>
        <h1 className="font-serif text-2xl font-semibold text-foreground mt-2">
          Edit Sale — Invoice #{String(invoice.number).padStart(4, '0')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Adjust the cart, customer, tax or notes of this prospect quotation.{' '}
          <Link href="/admin/sales" className="text-primary underline underline-offset-2">
            Back to Sales
          </Link>
        </p>
      </div>
      <SalesPos
        products={posProducts}
        editSale={{
          id: sale.id,
          invoiceNumber: invoice.number,
          customerName: sale.customerName,
          customerContact: sale.customerContact ?? '',
          customerEmail: sale.customerEmail ?? '',
          taxRate: sale.taxRate.toNumber(),
          notes: sale.notes ?? '',
          items: sale.items
            .filter((item) => item.productId)
            .map((item) => ({
              productId: item.productId as string,
              variantLabel: item.variantLabel,
              unitPrice: item.unitPrice.toNumber(),
              quantity: item.quantity,
            })),
        }}
      />
    </div>
  );
}
