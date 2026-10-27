'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import type { BlogPost } from '@/lib/content';

interface BlogPostContentProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogPostContent({ post, relatedPosts }: BlogPostContentProps) {
  const ref = useRef<HTMLDivElement>(null);

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
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="scroll-reveal">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/70 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
        </div>

        {/* Post Header */}
        <header className="mt-6 mb-10">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground scroll-reveal">
            <span className="text-accent font-medium uppercase tracking-wide">{post.category}</span>
            <span aria-hidden="true">•</span>
            <span>{post.date}</span>
            <span aria-hidden="true">•</span>
            <span>{post.readTime}</span>
          </div>
          <h1 className="text-display font-serif font-light italic text-foreground mt-4 leading-tight scroll-reveal scroll-reveal-delay-1">
            {post.title}
          </h1>
          <p className="text-muted-foreground mt-5 leading-relaxed text-base lg:text-lg scroll-reveal scroll-reveal-delay-2">
            {post.excerpt}
          </p>
        </header>

        {/* Hero Image */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl scroll-reveal" style={{ aspectRatio: '21/9' }}>
          <AppImage
            src={post.image}
            alt={post.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px" />
        </div>

        {/* Photo Gallery */}
        {post.gallery && post.gallery.length > 0 &&
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 scroll-reveal">
          {post.gallery.map((photo, i) =>
          <div key={i} className="relative rounded-2xl overflow-hidden border border-border" style={{ aspectRatio: '4/3' }}>
              <AppImage
                src={photo}
                alt={`${post.alt} — photo ${i + 2}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw" />
            </div>
          )}
        </div>
        }

        {/* Post Body */}
        <div className="mt-12 space-y-10">
          {post.sections.map((section, i) =>
          <section key={i} className="scroll-reveal">
            {section.heading &&
            <h2 className="font-serif font-semibold text-xl lg:text-2xl text-foreground mb-4">
                {section.heading}
              </h2>
            }
            <div className="space-y-4">
              {section.paragraphs.map((paragraph, j) =>
              <p key={j} className="text-muted-foreground leading-relaxed text-base">
                  {paragraph}
                </p>
              )}
            </div>
            {section.list &&
            <ul className="mt-5 space-y-3">
                {section.list.map((item, j) =>
                <li key={j} className="flex items-start gap-3 text-sm text-foreground">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    {item}
                  </li>
                )}
              </ul>
            }
          </section>
          )}
        </div>

        {/* Consultation CTA */}
        <div className="mt-14 bg-muted/50 border border-border rounded-2xl p-8 scroll-reveal">
          <h3 className="font-serif text-xl font-semibold text-foreground mb-3">Looking for Personalized Guidance?</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Articles are a wonderful starting point — but every person's journey is unique. Our consultations offer warm, wholistic guidance tailored to your situation.
          </p>
          <Link
            href="/consultations?book=1"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book a Consultation
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-xs text-muted-foreground leading-relaxed scroll-reveal">
          This article is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making changes to your diet, lifestyle, or wellness routine — especially if pregnant, nursing, on medication, or living with a chronic condition.
        </p>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 &&
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="border-t border-border pt-12">
          <h2 className="text-headline font-serif font-light italic text-foreground mb-8 scroll-reveal">
            More from <span className="text-primary">Our Blog</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.slice(0, 3).map((related, i) =>
            <Link
              key={related.slug}
              href={`/blog/${related.slug}`}
              className={`group bg-card border border-border rounded-2xl overflow-hidden shadow-sm card-hover scroll-reveal scroll-reveal-delay-${Math.min(i + 1, 6)}`}>

              <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <AppImage
                  src={related.image}
                  alt={related.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              </div>
              <div className="p-5 flex flex-col gap-2.5">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="text-accent font-medium uppercase tracking-wide">{related.category}</span>
                  <span aria-hidden="true">•</span>
                  <span>{related.date}</span>
                </div>
                <h3 className="font-serif font-semibold text-lg text-card-foreground leading-snug">{related.title}</h3>
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
        </div>
      </div>
      }
    </div>);
}
