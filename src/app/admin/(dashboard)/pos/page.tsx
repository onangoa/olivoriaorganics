import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import SalesPos, { type PosProduct } from '@/app/admin/components/SalesPos';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Point of Sale — Olivoria Organics Admin',
};

export default async function AdminPosPage() {
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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Point of Sale</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quick-sale till — tap product sizes to build a cart and complete the sale in seconds.
            Stats and history live on the{' '}
            <Link href="/admin/sales" className="font-semibold underline underline-offset-2">
              Sales
            </Link>{' '}
            page.
          </p>
        </div>
        <Link
          href="/admin/sales"
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-border text-sm font-semibold text-foreground transition-colors hover:bg-muted whitespace-nowrap"
        >
          View Sales Stats
        </Link>
      </div>
      <SalesPos products={posProducts} />
    </div>
  );
}
