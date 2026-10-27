import React from 'react';
import { getProductCategories, getAvailableVariantLabels } from '@/lib/content';
import ProductForm from '@/app/admin/components/ProductForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Product — Olivoria Organics Admin',
};

export default async function NewProductPage() {
  const [categories, availableLabels] = await Promise.all([
    getProductCategories(),
    getAvailableVariantLabels(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <span className="section-label">Catalogue</span>
        <h1 className="font-serif font-semibold text-2xl text-foreground mt-2">Add Product</h1>
      </div>
      <ProductForm categories={categories} availableLabels={availableLabels} />
    </div>
  );
}
