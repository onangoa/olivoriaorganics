import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AboutContent from '@/app/about/components/AboutContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About OlivoriaOrganics — Our Story, Mission & Values',
  description: 'Learn about OlivoriaOrganics — our story, mission, wholistic approach to health, and the Christian/Adventist values that guide everything we do.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <AboutContent />
      <Footer />
    </main>
  );
}