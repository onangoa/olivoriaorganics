import React from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogPostContent from '@/app/blog/components/BlogPostContent';
import { getBlogPosts, getPostBySlug } from '@/lib/content';
import type { Metadata } from 'next';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: 'Article Not Found — Olivoria Organics' };
  }
  return {
    title: `${post.title} | Olivoria Organics Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = (await getBlogPosts()).filter((p) => p.slug !== post.slug);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <BlogPostContent post={post} relatedPosts={relatedPosts} />
      <Footer />
    </main>
  );
}
