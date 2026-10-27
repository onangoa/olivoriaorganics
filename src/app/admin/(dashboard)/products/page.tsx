import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { deleteProduct } from '@/app/admin/product-actions';
import DeleteButton from '@/app/admin/components/DeleteButton';
import { formatKES } from '@/lib/money';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products — Olivoria Organics Admin',
};

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
    include: { variants: { orderBy: { position: 'asc' } } },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} in the catalogue.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold transition-opacity hover:opacity-90"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border">
          <p className="text-base font-serif italic">No products yet.</p>
          <p className="mt-2 text-sm">Add your first product to start building the catalogue.</p>
        </div>
      ) : (
        <>
          {/* Table — tablet and up */}
          <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
                    <th className="px-5 py-3.5 font-medium">Product</th>
                    <th className="px-5 py-3.5 font-medium">Category</th>
                    <th className="px-5 py-3.5 font-medium">Price</th>
                    <th className="px-5 py-3.5 font-medium">Stock</th>
                    <th className="px-5 py-3.5 font-medium">Availability</th>
                    <th className="px-5 py-3.5 font-medium">Updated</th>
                    <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {product.name}
                          {product.featured && (
                            <span className="ml-2 text-accent text-xs" aria-label="Featured">
                              ★
                            </span>
                          )}
                          {product.type === 'service' && (
                            <span className="ml-2 text-[10px] uppercase tracking-wider text-accent border border-accent/40 rounded-full px-1.5 py-0.5">
                              Service
                            </span>
                          )}
                        </Link>
                        <span className="block text-xs text-muted-foreground mt-0.5 font-mono">
                          {product.id}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{product.category}</td>
                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                        {product.variants.length > 1
                          ? `From ${formatKES(product.price.toNumber())}`
                          : formatKES(product.price.toNumber())}
                        <span className="block text-xs text-muted-foreground/70 mt-0.5">
                          {product.variants
                            .map((v) => `${v.label} ${formatKES(v.price.toNumber())}`)
                            .join(' · ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {product.type === 'service' ? (
                          <span className="font-normal text-muted-foreground">—</span>
                        ) : (
                          <span
                            className={
                              product.stock > 0
                                ? 'font-semibold text-foreground'
                                : 'font-semibold text-red-600'
                            }
                          >
                            {product.stock}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                        {product.type === 'service' ? 'Bookable' : product.availability}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                        {dateFormat.format(product.updatedAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-4">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="text-xs font-semibold text-primary underline underline-offset-2"
                          >
                            Edit
                          </Link>
                          <DeleteButton
                            action={deleteProduct.bind(null, product.id)}
                            confirmMessage={`Delete "${product.name}"? This cannot be undone.`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards — mobile */}
          <div className="md:hidden space-y-3">
            {products.map((product) => (
              <div key={product.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-medium text-foreground"
                    >
                      {product.name}
                      {product.featured && <span className="ml-1.5 text-accent text-xs">★</span>}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary whitespace-nowrap">
                    {product.variants.length > 1
                      ? `From ${formatKES(product.price.toNumber())}`
                      : formatKES(product.price.toNumber())}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {product.type === 'service'
                      ? 'Bookable service · '
                      : `${product.availability} · ${product.stock} in stock · `}
                    {dateFormat.format(product.updatedAt)}
                  </span>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-xs font-semibold text-primary underline underline-offset-2"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      action={deleteProduct.bind(null, product.id)}
                      confirmMessage={`Delete "${product.name}"? This cannot be undone.`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
