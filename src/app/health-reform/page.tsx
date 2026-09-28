import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HealthReformContent from '@/app/health-reform/components/HealthReformContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Health Reform — OlivoriaOrganics',
  description: 'Explore the 8 foundational pillars of wholistic health reform: nutrition, exercise, water, sunlight, fresh air, rest, temperance, and spiritual wellbeing.',
};

export default function HealthReformPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HealthReformContent />
      <Footer />
    </main>
  );
}