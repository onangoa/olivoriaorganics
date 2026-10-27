import React from 'react';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/content';
import PostForm from '@/app/admin/components/PostForm';
import type { Metadata } from 'next';

interface EditPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EditPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit ${slug} — Olivoria Organics Admin` };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div>
      <div className="mb-8">
        <span className="section-label">Content</span>
        <h1 className="font-serif font-semibold text-2xl text-foreground mt-2">Edit Blog Post</h1>
        <p className="text-sm text-muted-foreground mt-1">{post.title} — <span className="font-mono">{post.slug}</span></p>
      </div>
      <PostForm post={post} />
    </div>
  );
}
