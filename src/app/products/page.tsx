import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductsContent from '@/app/products/components/ProductsContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Organic Products — OlivoriaOrganics',
  description: 'Browse our full range of premium organic foods, herbal teas, natural supplements, herbs, personal care, and wellness products. Enquire via WhatsApp.',
};

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <ProductsContent />
      <Footer />
    </main>
  );
}