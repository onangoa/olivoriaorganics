import React from 'react';
import PostForm from '@/app/admin/components/PostForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Post — Olivoria Organics Admin',
};

export default async function NewPostPage() {
  return (
    <div>
      <div className="mb-8">
        <span className="section-label">Content</span>
        <h1 className="font-serif font-semibold text-2xl text-foreground mt-2">New Blog Post</h1>
      </div>
      <PostForm />
    </div>
  );
}
