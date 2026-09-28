'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

export default function IntroSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.scroll-reveal').forEach((el) => {
              el.classList.add('revealed');
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    if (ref?.current) observer?.observe(ref?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <div className="scroll-reveal relative">
            <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ aspectRatio: '3/4' }}>
              <AppImage
                src="https://images.unsplash.com/photo-1594089195017-27d5eddb2461"
                alt="Organic vegetables and natural health products displayed on a bright natural surface in warm afternoon light"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw" />
              
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full border-2 border-primary/10 pointer-events-none" aria-hidden="true" />
            <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full border border-accent/20 pointer-events-none" aria-hidden="true" />
          </div>

          {/* Text Side */}
          <div className="flex flex-col gap-6 justify-between h-full">
            <div className="scroll-reveal scroll-reveal-delay-1">
              <span className="section-label">Our Story</span>
            </div>

            <div className="scroll-reveal scroll-reveal-delay-2">
              <h2 className="text-display font-serif font-light italic text-foreground">
                Rooted in Nature,<br />
                <span className="text-primary">Guided by Faith</span>
              </h2>
            </div>

            <div className="space-y-4 scroll-reveal scroll-reveal-delay-3">
              <p className="text-muted-foreground leading-relaxed">
                OlivoriaOrganics was born from a deep conviction that true wellness is wholistic — embracing the physical, mental, emotional, social, and spiritual dimensions of health. We believe that God's original design for humanity includes vibrant health, and that returning to natural, whole foods and organic living is a meaningful step toward that design.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We exist to help individuals and families make healthier lifestyle choices through carefully selected organic products, practical health education, personalized consultations, and lifestyle guidance rooted in proven health reform principles.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Everything we offer is selected with care, integrity, and a genuine desire to see people thrive — not just survive.
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-border scroll-reveal scroll-reveal-delay-4">
              <div className="text-center">
                <div className="font-serif text-2xl font-semibold text-primary">8</div>
                <div className="text-xs text-muted-foreground mt-1">Health Pillars</div>
              </div>
              <div className="text-center border-x border-border">
                <div className="font-serif text-2xl font-semibold text-primary">100+</div>
                <div className="text-xs text-muted-foreground mt-1">Organic Products</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-2xl font-semibold text-primary">Wholistic</div>
                <div className="text-xs text-muted-foreground mt-1">Wellness Focus</div>
              </div>
            </div>

            <div className="scroll-reveal scroll-reveal-delay-5">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-200 shadow-md hover:-translate-y-0.5">
                
                Learn More About Us
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>);

}