'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/slugify';
import { logActivity } from '@/lib/activity';
import { cleanupOrphanedImages, galleryJsonFilter } from '@/lib/images';

export interface PostSectionInput {
  heading?: string;
  paragraphs: string[];
  list?: string[];
}

export interface PostInput {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  gallery?: string[];
  alt: string;
  featured: boolean;
  sections: PostSectionInput[];
}

export type PostActionResult = { ok: true; slug: string } | { ok: false; error: string };

async function requireSession(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');
  return session.user.email ?? 'unknown user';
}

function validate(input: PostInput): string | null {
  if (!input.title?.trim()) return 'Title is required.';
  if (!input.excerpt?.trim()) return 'Excerpt is required.';
  if (!input.category?.trim()) return 'Category is required.';
  if (!input.date?.trim()) return 'Date is required.';
  if (!input.image?.trim()) return 'Image path is required.';
  if (!input.alt?.trim()) return 'Image description (alt text) is required.';
  if (!input.sections || input.sections.length === 0)
    return 'Add at least one section with a paragraph.';
  for (const [index, section] of input.sections.entries()) {
    if (!section.paragraphs || section.paragraphs.length === 0) {
      return `Section ${index + 1} needs at least one paragraph.`;
    }
  }
  return null;
}

function toPostData(input: PostInput) {
  return {
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    category: input.category.trim(),
    date: input.date.trim(),
    readTime: input.readTime?.trim() || '5 min read',
    image: input.image.trim(),
    gallery: galleryJsonFilter(input.gallery),
    alt: input.alt.trim(),
    featured: Boolean(input.featured),
    sections: input.sections.map((section) => ({
      heading: section.heading?.trim() || undefined,
      paragraphs: section.paragraphs,
      ...(section.list && section.list.length > 0 ? { list: section.list } : {}),
    })),
  };
}

function revalidatePostPages(slug: string) {
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/admin/blog');
}

export async function createPost(input: PostInput): Promise<PostActionResult> {
  try {
    const userEmail = await requireSession();
    const invalid = validate(input);
    if (invalid) return { ok: false, error: invalid };

    const slug = slugify(input.title);
    if (!slug) return { ok: false, error: 'Could not derive a valid slug from the title.' };

    const exists = await prisma.blogPost.findUnique({ where: { slug } });
    if (exists) return { ok: false, error: `A post with slug "${slug}" already exists.` };

    await prisma.blogPost.create({ data: { slug, ...toPostData(input) } });
    await logActivity({
      action: 'post.create',
      entity: 'Blog Post',
      entityId: slug,
      message: `Created blog post "${input.title.trim()}" (${input.category.trim()}).`,
      userEmail,
    });
    revalidatePostPages(slug);
    await cleanupOrphanedImages();
    return { ok: true, slug };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Failed to create post.' };
  }
}

export async function updatePost(slug: string, input: PostInput): Promise<PostActionResult> {
  try {
    const userEmail = await requireSession();
    const invalid = validate(input);
    if (invalid) return { ok: false, error: invalid };

    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (!existing) return { ok: false, error: 'Post not found.' };

    await prisma.blogPost.update({ where: { slug }, data: toPostData(input) });
    await logActivity({
      action: 'post.update',
      entity: 'Blog Post',
      entityId: slug,
      message: `Updated blog post "${existing.title}".`,
      userEmail,
    });
    revalidatePostPages(slug);
    await cleanupOrphanedImages();
    return { ok: true, slug };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Failed to update post.' };
  }
}

export async function deletePost(
  slug: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userEmail = await requireSession();
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (!existing) return { ok: false, error: 'Post not found.' };

    await prisma.blogPost.delete({ where: { slug } });
    await logActivity({
      action: 'post.delete',
      entity: 'Blog Post',
      entityId: slug,
      message: `Deleted blog post "${existing.title}".`,
      userEmail,
    });
    revalidatePostPages(slug);
    await cleanupOrphanedImages();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Failed to delete post.' };
  }
}
