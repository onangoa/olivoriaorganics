import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConsultationsContent from '@/app/consultations/components/ConsultationsContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Health & Wellness Consultations — OlivoriaOrganics',
  description: 'Request a personalized health and wellness consultation with OlivoriaOrganics. Wholistic lifestyle guidance, nutrition, health reform, and family wellness support.',
};

export default function ConsultationsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <ConsultationsContent />
      <Footer />
    </main>
  );
}