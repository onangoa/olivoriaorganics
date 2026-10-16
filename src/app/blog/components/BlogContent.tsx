'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import type { BlogPost } from '@/lib/content';

interface BlogContentProps {
  posts: BlogPost[];
}

export default function BlogContent({ posts }: BlogContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const featuredPost = posts.find((post) => post.featured) ?? posts[0];
  const otherPosts = posts.filter((post) => post.slug !== featuredPost?.slug);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.scroll-reveal').forEach((el) => el.classList.add('revealed'));
          }
        });
      },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="pt-24 pb-20">
      {/* Page Header */}
      <div className="bg-muted/30 border-b border-border py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="section-label scroll-reveal">Our Blog</span>
            <h1 className="text-display font-serif font-light italic text-foreground mt-4 scroll-reveal scroll-reveal-delay-1">
              Wholistic Wellness,<br />
              <span className="text-primary">Shared with Care</span>
            </h1>
            <p className="text-muted-foreground mt-4 leading-relaxed scroll-reveal scroll-reveal-delay-2">
              Practical wisdom for natural living — nourishing food, herbal teas, kitchen spices, and everyday habits that nurture body, mind, and spirit.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Featured Post */}
        {featuredPost &&
        <article className="scroll-reveal">
            <Link href={`/blog/${featuredPost.slug}`} className="group grid lg:grid-cols-2 bg-card border border-border rounded-3xl overflow-hidden shadow-sm card-hover">
              <div className="relative overflow-hidden min-h-[280px]" style={{ aspectRatio: '16/10' }}>
                <AppImage
                  src={featuredPost.image}
                  alt={featuredPost.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw" />
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-2 py-0.5 bg-accent text-accent-foreground text-xs font-semibold rounded-full">Featured</span>
                </div>
              </div>
              <div className="p-8 lg:p-10 flex flex-col justify-center gap-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="text-accent font-medium uppercase tracking-wide">{featuredPost.category}</span>
                  <span aria-hidden="true">•</span>
                  <span>{featuredPost.date}</span>
                  <span aria-hidden="true">•</span>
                  <span>{featuredPost.readTime}</span>
                </div>
                <h2 className="font-serif font-semibold text-xl lg:text-2xl text-card-foreground leading-snug">
                  {featuredPost.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{featuredPost.excerpt}</p>
                <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold mt-2">
                  Read Article
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          </article>
        }

        {/* More Posts */}
        <div className="flex items-end justify-between gap-6 mt-16 mb-8">
          <h2 className="text-headline font-serif font-light italic text-foreground scroll-reveal">
            Latest <span className="text-primary">Articles</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherPosts.map((post, i) =>
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className={`group bg-card border border-border rounded-2xl overflow-hidden shadow-sm card-hover scroll-reveal scroll-reveal-delay-${Math.min(i + 1, 6)}`}>

            <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <AppImage
                src={post.image}
                alt={post.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
            </div>
            <div className="p-5 flex flex-col gap-2.5">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="text-accent font-medium uppercase tracking-wide">{post.category}</span>
                <span aria-hidden="true">•</span>
                <span>{post.date}</span>
              </div>
              <h3 className="font-serif font-semibold text-lg text-card-foreground leading-snug">{post.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{post.excerpt}</p>
              <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold mt-1">
                Read Article
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
          )}
        </div>

        {/* Topic Suggestion CTA */}
        <div className="mt-16 bg-primary rounded-3xl p-8 lg:p-12 overflow-hidden relative scroll-reveal">
          <div className="absolute inset-0 pointer-events-none opacity-10" aria-hidden="true">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)' }} />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-serif font-light italic text-primary-foreground text-2xl lg:text-3xl">
              Have a Topic You'd Love Us to Write About?
            </h2>
            <p className="text-primary-foreground/80 mt-3 leading-relaxed text-sm lg:text-base">
              We write from real questions. If there's a wellness topic you'd like us to explore — nourishing foods, herbal teas, spices, or supportive living — tell us and we may feature it in an upcoming article.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-primary font-semibold text-sm hover:bg-primary-foreground/90 transition-all duration-200 shadow-md hover:-translate-y-0.5">
                Suggest a Topic
              </Link>
              <Link
                href="/consultations"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-primary-foreground/30 text-primary-foreground font-semibold text-sm hover:bg-primary-foreground/10 transition-all duration-200">
                Book a Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
