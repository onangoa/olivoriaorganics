import React from 'react';
import { notFound } from 'next/navigation';
import { getProductById, getProductCategories, getAvailableVariantLabels } from '@/lib/content';
import ProductForm from '@/app/admin/components/ProductForm';
import type { Metadata } from 'next';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Edit ${id} — Olivoria Organics Admin` };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories, availableLabels] = await Promise.all([
    getProductById(id),
    getProductCategories(),
    getAvailableVariantLabels(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <div className="mb-8">
        <span className="section-label">Catalogue</span>
        <h1 className="font-serif font-semibold text-2xl text-foreground mt-2">Edit Product</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {product.name} — <span className="font-mono">{product.id}</span>
        </p>
      </div>
      <ProductForm categories={categories} availableLabels={availableLabels} product={product} />
    </div>
  );
}
