import React from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductDetailContent from '@/app/products/components/ProductDetailContent';
import { getProducts, getProductById } from '@/lib/content';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return getProducts().map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) {
    return { title: 'Product Not Found — Olivoria Organics' };
  }
  return {
    title: `${product.name} — Olivoria Organics`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const sameCategory = getProducts().filter((p) => p.id !== product.id && p.category === product.category);
  const others = getProducts().filter((p) => p.id !== product.id && p.category !== product.category);
  const relatedProducts = [...sameCategory, ...others].slice(0, 3);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <ProductDetailContent product={product} relatedProducts={relatedProducts} />
      <Footer />
    </main>
  );
}
