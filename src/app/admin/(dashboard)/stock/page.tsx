import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stock Movements — Olivoria Organics Admin',
};

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const REASONS: Record<string, { label: string; className: string }> = {
  initial: { label: 'Initial', className: 'bg-muted text-muted-foreground' },
  adjustment: { label: 'Adjustment', className: 'bg-accent/20 text-accent' },
  sale: { label: 'Sale', className: 'bg-primary/10 text-primary' },
  'sale-reversal': { label: 'Reversal', className: 'bg-red-50 text-red-700' },
};

export default async function AdminStockPage() {
  const [products, movements] = await Promise.all([
    prisma.product.findMany({
      select: { id: true, name: true, category: true, type: true, stock: true, availability: true },
      orderBy: { name: 'asc' },
    }),
    prisma.stockMovement.findMany({
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
  ]);

  // Services are bookable and carry no stock — keep them out of stock stats.
  const physicalProducts = products.filter((product) => product.type !== 'service');
  const totalUnits = physicalProducts.reduce((sum, product) => sum + product.stock, 0);
  const outOfStock = physicalProducts.filter((product) => product.stock <= 0).length;

  const stats = [
    { label: 'Units in Stock', value: String(totalUnits) },
    { label: 'Products', value: String(products.length) },
    { label: 'Out of Stock', value: String(outOfStock) },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Stock Movements</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every stock change is logged — completed invoices (sales), reversals on deletion, and
          manual edits.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 mb-10">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
              {stat.value}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <h2 className="font-serif font-semibold text-lg text-foreground mb-4">Current Stock</h2>
      <div className="rounded-2xl border border-border overflow-hidden mb-10">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border bg-muted/30">
              <th className="px-5 py-3.5 font-medium">Product</th>
              <th className="px-5 py-3.5 font-medium">Category</th>
              <th className="px-5 py-3.5 font-medium">Stock</th>
              <th className="px-5 py-3.5 font-medium">Availability</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isService = product.type === 'service';
              return (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {product.name}
                      {isService && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-accent border border-accent/40 rounded-full px-1.5 py-0.5">
                          Service
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{product.category}</td>
                  <td className="px-5 py-3.5 font-semibold whitespace-nowrap">
                    {isService ? (
                      <span className="font-normal text-muted-foreground">—</span>
                    ) : (
                      <span className={product.stock > 0 ? 'text-foreground' : 'text-red-600'}>
                        {product.stock}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                    {isService ? 'Bookable' : product.availability}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="font-serif font-semibold text-lg text-foreground mb-4">Movement Log</h2>

      {movements.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border">
          <p className="text-base font-serif italic">No stock movements yet.</p>
          <p className="mt-2 text-sm">
            Movements appear when invoices are completed, sales are deleted, or product stock is
            edited.
          </p>
        </div>
      ) : (
        <>
          {/* Table — tablet and up */}
          <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
                    <th className="px-5 py-3.5 font-medium">Date</th>
                    <th className="px-5 py-3.5 font-medium">Product</th>
                    <th className="px-5 py-3.5 font-medium">Change</th>
                    <th className="px-5 py-3.5 font-medium">Reason</th>
                    <th className="px-5 py-3.5 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => {
                    const reason = REASONS[movement.reason] ?? {
                      label: movement.reason,
                      className: 'bg-muted text-muted-foreground',
                    };
                    return (
                      <tr
                        key={movement.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                          {dateFormat.format(movement.createdAt)}
                        </td>
                        <td className="px-5 py-4 font-medium text-foreground">
                          {movement.product.name}
                        </td>
                        <td
                          className={`px-5 py-4 font-semibold whitespace-nowrap ${
                            movement.delta < 0 ? 'text-red-600' : 'text-primary'
                          }`}
                        >
                          {movement.delta > 0 ? `+${movement.delta}` : movement.delta}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${reason.className}`}
                          >
                            {reason.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{movement.note ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards — mobile */}
          <div className="md:hidden space-y-3">
            {movements.map((movement) => {
              const reason = REASONS[movement.reason] ?? {
                label: movement.reason,
                className: 'bg-muted text-muted-foreground',
              };
              return (
                <div key={movement.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{movement.product.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {dateFormat.format(movement.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold whitespace-nowrap ${
                        movement.delta < 0 ? 'text-red-600' : 'text-primary'
                      }`}
                    >
                      {movement.delta > 0 ? `+${movement.delta}` : movement.delta}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${reason.className}`}
                    >
                      {reason.label}
                    </span>
                    {movement.note && (
                      <span className="text-xs text-muted-foreground text-right">
                        {movement.note}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
