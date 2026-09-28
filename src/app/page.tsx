import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/app/components/HeroSection';
import IntroSection from '@/app/components/IntroSection';
import FeaturedProducts from '@/app/components/FeaturedProducts';
import OurApproach from '@/app/components/OurApproach';
import ConsultationsTeaser from '@/app/components/ConsultationsTeaser';
import TestimonialsSection from '@/app/components/TestimonialsSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OlivoriaOrganics — Natural Living, Healthier Choices, Wholistic Wellness',
  description: 'Discover premium organic products, wellness consultations, and health education rooted in wholistic living. OlivoriaOrganics — nourishing body, mind, and spirit.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <IntroSection />
      <FeaturedProducts />
      <OurApproach />
      <ConsultationsTeaser />
      <TestimonialsSection />
      <Footer />
    </main>
  );
}