'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * 100;
      const y = (e.clientY - rect.top) / rect.height * 100;
      section.style.setProperty('--cursor-x', `${x}%`);
      section.style.setProperty('--cursor-y', `${y}%`);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-background leaf-bg pt-16 lg:pt-20"
      style={{ '--cursor-x': '60%', '--cursor-y': '40%' } as React.CSSProperties}>
      
      {/* Atmospheric background layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial gradient that follows cursor */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: 'radial-gradient(ellipse 60% 60% at var(--cursor-x, 60%) var(--cursor-y, 40%), rgba(45,80,22,0.07) 0%, transparent 70%)'
          }} />
        
        {/* Static atmospheric blobs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full gentle-pulse" style={{ background: 'radial-gradient(circle, rgba(107,143,71,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/3 left-1/6 w-72 h-72 rounded-full gentle-pulse" style={{ background: 'radial-gradient(circle, rgba(139,105,20,0.06) 0%, transparent 70%)', animationDelay: '3s' }} />
      </div>

      {/* Floating leaf decorations */}
      <div className="absolute top-32 right-8 lg:right-16 opacity-20 float-leaf pointer-events-none" aria-hidden="true">
        <svg width="60" height="90" viewBox="0 0 60 90" fill="none">
          <path d="M30 2C30 2 58 20 58 50C58 72 46 86 30 88C14 86 2 72 2 50C2 20 30 2 30 2Z" fill="#099C4E" />
          <path d="M30 88V20" stroke="#88C541" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="absolute bottom-24 left-8 lg:left-16 opacity-15 float-leaf-slow pointer-events-none" aria-hidden="true">
        <svg width="40" height="60" viewBox="0 0 40 60" fill="none">
          <path d="M20 2C20 2 38 14 38 34C38 48 30 58 20 59C10 58 2 48 2 34C2 14 20 2 20 2Z" fill="#88C541" />
          <path d="M20 59V14" stroke="#099C4E" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>
      <div className="absolute top-1/2 right-4 lg:right-32 opacity-10 float-leaf pointer-events-none" style={{ animationDelay: '4s' }} aria-hidden="true">
        <svg width="30" height="45" viewBox="0 0 30 45" fill="none">
          <path d="M15 2C15 2 28 10 28 25C28 36 22 43 15 44C8 43 2 36 2 25C2 10 15 2 15 2Z" fill="#8B6914" />
        </svg>
      </div>

      {/* Grain texture overlay */}
      <div className="absolute inset-0 grain-overlay pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col gap-7">
            {/* Eyebrow */}
            <div className="hero-enter">
              <span className="section-label">
                <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                Wholistic Health & Wellness
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-hero font-serif font-light italic text-foreground hero-enter-delay-1">
              <span className="block text-primary">Natural Living.</span>
              <span className="block" style={{ color: 'var(--secondary)' }}>Healthier Choices.</span>
              <span className="block text-foreground">Wholistic Wellness.</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl hero-enter-delay-2">
              Olivoria Organics provides premium organic products, health education, wellness consultations, and lifestyle guidance — rooted in a wholistic approach to health that nurtures body, mind, and spirit.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 hero-enter-delay-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                
                Explore Our Products
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-primary/30 text-primary font-semibold text-sm bg-primary/5 hover:bg-primary/10 transition-all duration-200">
                
                Learn About Our Approach
              </Link>
            </div>

            {/* Trust Stats */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-border hero-enter-delay-4">
              <div>
                <div className="font-serif text-2xl font-semibold text-primary">100%</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">Organic</div>
              </div>
              <div>
                <div className="font-serif text-2xl font-semibold text-primary">Wholistic</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">Approach</div>
              </div>
              <div>
                <div className="font-serif text-2xl font-semibold text-primary">Faith</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">Informed</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="lg:col-span-5 hero-enter-delay-2">
            <div className="relative">
              {/* Main image card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ aspectRatio: '4/5' }}>
                <AppImage
                  src="/assets/images/olivoria.jpeg"
                  alt="Fresh organic herbs and natural wellness products arranged on a warm wooden surface with soft natural lighting"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 45vw" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
              </div>
              {/* Floating stat card */}
              <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl p-4 shadow-lg">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Est.</div>
                <div className="font-serif text-xl font-semibold text-primary">Trusted</div>
                <div className="text-xs text-muted-foreground">Organic Wellness</div>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground rounded-2xl px-4 py-3 shadow-lg">
                <div className="text-xs font-semibold uppercase tracking-wider">Wholistic</div>
                <div className="text-xs opacity-80">Health</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}