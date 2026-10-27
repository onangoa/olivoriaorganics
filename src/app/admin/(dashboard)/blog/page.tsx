import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { deletePost } from '@/app/admin/post-actions';
import DeleteButton from '@/app/admin/components/DeleteButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog Posts — Olivoria Organics Admin',
};

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">{posts.length} published.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold transition-opacity hover:opacity-90"
        >
          + New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border">
          <p className="text-base font-serif italic">No posts yet.</p>
          <p className="mt-2 text-sm">Write your first article to start the blog.</p>
        </div>
      ) : (
        <>
          {/* Table — tablet and up */}
          <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
                    <th className="px-5 py-3.5 font-medium">Title</th>
                    <th className="px-5 py-3.5 font-medium">Category</th>
                    <th className="px-5 py-3.5 font-medium">Date</th>
                    <th className="px-5 py-3.5 font-medium">Updated</th>
                    <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.slug} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <Link href={`/admin/blog/${post.slug}`} className="font-medium text-foreground hover:text-primary transition-colors">
                          {post.title}
                          {post.featured && <span className="ml-2 text-accent text-xs" aria-label="Featured">★</span>}
                        </Link>
                        <span className="block text-xs text-muted-foreground mt-0.5 font-mono">{post.slug}</span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{post.category}</td>
                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{post.date}</td>
                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{dateFormat.format(post.updatedAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-4">
                          <Link href={`/admin/blog/${post.slug}`} className="text-xs font-semibold text-primary underline underline-offset-2">
                            Edit
                          </Link>
                          <DeleteButton
                            action={deletePost.bind(null, post.slug)}
                            confirmMessage={`Delete "${post.title}"? This cannot be undone.`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards — mobile */}
          <div className="md:hidden space-y-3">
            {posts.map((post) => (
              <div key={post.slug} className="rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/blog/${post.slug}`} className="font-medium text-foreground">
                      {post.title}
                      {post.featured && <span className="ml-1.5 text-accent text-xs">★</span>}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{post.category} · {post.date}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-4 mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground mr-auto">Updated {dateFormat.format(post.updatedAt)}</span>
                  <Link href={`/admin/blog/${post.slug}`} className="text-xs font-semibold text-primary underline underline-offset-2">
                    Edit
                  </Link>
                  <DeleteButton
                    action={deletePost.bind(null, post.slug)}
                    confirmMessage={`Delete "${post.title}"? This cannot be undone.`}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
