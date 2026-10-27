import React from 'react';
import prisma from '@/lib/prisma';
import CategoriesManager, { type CategoryRow } from '@/app/admin/components/CategoriesManager';
import { parseVariantLabels } from '@/lib/content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Categories — Olivoria Organics Admin',
};

export default async function AdminCategoriesPage() {
  const [declared, grouped, productsWithVariants] = await Promise.all([
    prisma.category.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.product.groupBy({ by: ['category'], _count: { _all: true } }),
    prisma.product.findMany({
      select: { name: true, category: true, variants: { select: { label: true } } },
    }),
  ]);

  const counts = new Map(grouped.map((group) => [group.category, group._count._all]));
  const declaredNames = new Set(declared.map((category) => category.name));

  const labelUsage: Record<string, Record<string, string[]>> = {};
  for (const product of productsWithVariants) {
    const category = (labelUsage[product.category] ??= {});
    for (const variant of product.variants) {
      const names = (category[variant.label] ??= []);
      if (!names.includes(product.name)) names.push(product.name);
    }
  }

  const rows: CategoryRow[] = [
    ...declared.map((category) => ({
      name: category.name,
      productCount: counts.get(category.name) ?? 0,
      declared: true,
      variantLabels: parseVariantLabels(category.variantLabels),
      labelUsage: labelUsage[category.name] ?? {},
    })),
    ...[...counts.entries()]
      .filter(([name]) => !declaredNames.has(name))
      .map(([name, count]) => ({
        name,
        productCount: count,
        declared: false,
        variantLabels: [] as string[],
        labelUsage: {} as Record<string, string[]>,
      })),
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Product Categories</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the categories shown on the Products page and in product forms. Variant labels set
          here (sizes/packaging) are picked from when adding or updating products in that category —
          labels already used by its products appear in the picker too, and a label in use
          can&apos;t be removed until it&apos;s unticked on those products. Renaming a category
          re-assigns all its products automatically.
        </p>
      </div>
      <CategoriesManager categories={rows} />
    </div>
  );
}
