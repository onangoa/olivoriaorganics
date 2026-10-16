import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductsContent from '@/app/products/components/ProductsContent';
import { getProducts } from '@/lib/content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Organic Products — Olivoria Organics',
  description: 'Browse our seeds and nuts, cold-pressed and essential oils, dried fruits, kitchen spices, botanical herbs, plant and herbal extracts, and tailored herbal teas. Enquire via WhatsApp.',
};

export default function ProductsPage() {
  const products = getProducts();

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <ProductsContent products={products} />
      <Footer />
    </main>
  );
}
