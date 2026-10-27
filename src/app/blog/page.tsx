import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogContent from '@/app/blog/components/BlogContent';
import { getBlogPosts } from '@/lib/content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Blog — Wholistic Wellness Insights | OlivoriaOrganics',
  description: 'Practical wisdom for natural living from OlivoriaOrganics — nourishing foods, herbal teas, kitchen spices, botanicals, and everyday habits that nurture body, mind, and spirit.',
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <BlogContent posts={posts} />
      <Footer />
    </main>
  );
}

