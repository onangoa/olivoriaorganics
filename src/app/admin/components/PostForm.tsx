'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createPost,
  updatePost,
  type PostInput,
  type PostSectionInput,
} from '@/app/admin/post-actions';
import PhotoUploader from '@/app/admin/components/PhotoUploader';
import type { BlogPost } from '@/lib/content';

interface PostFormProps {
  post?: BlogPost;
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all';

interface SectionDraft {
  heading: string;
  paragraphs: string;
  list: string;
}

function toDraft(sections: PostSectionInput[] | undefined): SectionDraft[] {
  if (!sections || sections.length === 0) {
    return [{ heading: '', paragraphs: '', list: '' }];
  }
  return sections.map((section) => ({
    heading: section.heading ?? '',
    paragraphs: (section.paragraphs ?? []).join('\n'),
    list: (section.list ?? []).join('\n'),
  }));
}

function linesToArray(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function todayLabel(): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());
}

export default function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const isEdit = Boolean(post);

  const [form, setForm] = useState({
    title: post?.title ?? '',
    excerpt: post?.excerpt ?? '',
    category: post?.category ?? 'General Wellness',
    date: post?.date ?? todayLabel(),
    readTime: post?.readTime ?? '5 min read',
    image: post?.image ?? '/assets/no_image.png',
    gallery: post?.gallery ?? [],
    alt: post?.alt ?? '',
    featured: post?.featured ?? false,
  });
  const [sections, setSections] = useState<SectionDraft[]>(toDraft(post?.sections));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setSection = (index: number, field: keyof SectionDraft, value: string) => {
    setSections((prev) =>
      prev.map((section, i) => (i === index ? { ...section, [field]: value } : section))
    );
  };

  const addSection = () =>
    setSections((prev) => [...prev, { heading: '', paragraphs: '', list: '' }]);

  const removeSection = (index: number) =>
    setSections((prev) => prev.filter((_, i) => i !== index));

  const moveSection = (index: number, direction: -1 | 1) => {
    setSections((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const buildInput = (): PostInput => ({
    ...form,
    gallery: form.gallery,
    sections: sections.map((section) => ({
      heading: section.heading.trim() || undefined,
      paragraphs: linesToArray(section.paragraphs),
      list: linesToArray(section.list),
    })),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result =
        isEdit && post ? await updatePost(post.slug, buildInput()) : await createPost(buildInput());
      if (!result.ok) {
        setError(result.error);
        setSaving(false);
        return;
      }
      router.push('/admin/blog');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div>
          <label htmlFor="postf-title" className="block text-sm font-medium text-foreground mb-1.5">
            Title *
          </label>
          <input
            id="postf-title"
            className={inputClass}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor="postf-excerpt"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Excerpt *{' '}
            <span className="text-muted-foreground font-normal">(1–2 sentence card summary)</span>
          </label>
          <textarea
            id="postf-excerpt"
            rows={2}
            className={`${inputClass} resize-y`}
            value={form.excerpt}
            onChange={(e) => set('excerpt', e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label
              htmlFor="postf-category"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Category *
            </label>
            <input
              id="postf-category"
              className={inputClass}
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="postf-date"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Date{' '}
            </label>
            <input
              id="postf-date"
              className={`${inputClass} bg-muted/50 text-muted-foreground cursor-default`}
              value={form.date}
              readOnly
              required
            />
          </div>
          <div>
            <label
              htmlFor="postf-readtime"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Read Time
            </label>
            <input
              id="postf-readtime"
              className={inputClass}
              value={form.readTime}
              onChange={(e) => set('readTime', e.target.value)}
            />
          </div>
          <div className="flex items-end pb-3">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              Featured post
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Photos *{' '}
            <span className="text-muted-foreground font-normal">(first photo is the banner)</span>
          </label>
          <PhotoUploader
            value={{ cover: form.image, gallery: form.gallery }}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, image: value.cover, gallery: value.gallery }))
            }
          />
        </div>
        <div>
          <label htmlFor="postf-alt" className="block text-sm font-medium text-foreground mb-1.5">
            Banner Photo Description (alt) *
          </label>
          <input
            id="postf-alt"
            className={inputClass}
            value={form.alt}
            onChange={(e) => set('alt', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-semibold text-lg text-foreground">Article Sections</h2>
          <button
            type="button"
            onClick={addSection}
            className="px-4 py-2 rounded-full border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/5 transition-colors"
          >
            + Add Section
          </button>
        </div>

        {sections.map((section, index) => (
          <div key={index} className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Section {index + 1}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveSection(index, -1)}
                  disabled={index === 0}
                  className="text-xs text-muted-foreground hover:text-primary disabled:opacity-30"
                  aria-label="Move section up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(index, 1)}
                  disabled={index === sections.length - 1}
                  className="text-xs text-muted-foreground hover:text-primary disabled:opacity-30"
                  aria-label="Move section down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  disabled={sections.length === 1}
                  className="text-xs font-semibold text-red-600 underline underline-offset-2 disabled:opacity-30"
                >
                  Remove
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor={`sec-heading-${index}`}
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Heading <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                id={`sec-heading-${index}`}
                className={inputClass}
                value={section.heading}
                onChange={(e) => setSection(index, 'heading', e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor={`sec-paragraphs-${index}`}
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Paragraphs *{' '}
                <span className="text-muted-foreground font-normal">(one paragraph per line)</span>
              </label>
              <textarea
                id={`sec-paragraphs-${index}`}
                rows={4}
                className={`${inputClass} resize-y`}
                value={section.paragraphs}
                onChange={(e) => setSection(index, 'paragraphs', e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor={`sec-list-${index}`}
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Bullet List{' '}
                <span className="text-muted-foreground font-normal">(optional, one per line)</span>
              </label>
              <textarea
                id={`sec-list-${index}`}
                rows={3}
                className={`${inputClass} resize-y`}
                value={section.list}
                onChange={(e) => setSection(index, 'list', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div
          className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-7 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Post'}
        </button>
        <Link
          href="/admin/blog"
          className="text-sm text-muted-foreground hover:text-primary underline underline-offset-2"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
