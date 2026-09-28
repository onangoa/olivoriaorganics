import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactContent from '@/app/contact/components/ContactContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — OlivoriaOrganics',
  description: 'Get in touch with OlivoriaOrganics via WhatsApp, email, or our contact form. We\'d love to hear from you about products, consultations, or general enquiries.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <ContactContent />
      <Footer />
    </main>
  );
}