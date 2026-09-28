'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

const pillars = [
  {
    icon: '🌿',
    title: 'Nutrition',
    description: 'Whole, natural, plant-rich foods form the foundation of vibrant health. We encourage nourishing the body with foods as close to their natural state as possible.',
  },
  {
    icon: '🏃',
    title: 'Exercise',
    description: 'Regular physical movement is essential to wellbeing. An active lifestyle supports cardiovascular health, mental clarity, and overall vitality.',
  },
  {
    icon: '💧',
    title: 'Water',
    description: 'Adequate hydration is fundamental to every bodily function. Pure water, consumed consistently, supports energy, digestion, and cellular health.',
  },
  {
    icon: '☀️',
    title: 'Sunlight',
    description: 'Appropriate exposure to natural sunlight supports vitamin D synthesis, mood regulation, and healthy sleep-wake cycles.',
  },
  {
    icon: '🌬️',
    title: 'Fresh Air',
    description: 'Clean, fresh air and healthy environments contribute to respiratory health and mental refreshment. Time in nature is restorative.',
  },
  {
    icon: '😴',
    title: 'Rest',
    description: 'Quality sleep and intentional periods of rest allow the body and mind to recover, repair, and renew. Rest is not laziness — it is wisdom.',
  },
  {
    icon: '⚖️',
    title: 'Temperance',
    description: 'Balanced and responsible lifestyle choices — moderation in all things, and abstinence from that which harms — lead to sustainable wellbeing.',
  },
  {
    icon: '✝️',
    title: 'Spiritual Wellbeing',
    description: 'We believe true wholistic health encompasses the spiritual dimension. A living connection with God brings peace, purpose, and inner wholeness.',
  },
];

export default function OurApproach() {
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
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );
    if (ref?.current) observer?.observe(ref?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="scroll-reveal mb-4 flex justify-center">
            <span className="section-label">Our Philosophy</span>
          </div>
          <h2 className="text-display font-serif font-light italic text-foreground scroll-reveal scroll-reveal-delay-1">
            The 8 Pillars of<br />
            <span className="text-primary">Wholistic Health</span>
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed scroll-reveal scroll-reveal-delay-2">
            Health is a whole-person concept involving physical, mental, emotional, social, and spiritual dimensions. These eight principles guide our approach to wellness.
          </p>
        </div>

        {/* Pillars Grid — 8 cards, 4 columns desktop, 2 tablet, 1 mobile */}
        {/* BENTO AUDIT: Row 1: [Nutrition cs-1] [Exercise cs-1] [Water cs-1] [Sunlight cs-1] | Row 2: [FreshAir cs-1] [Rest cs-1] [Temperance cs-1] [Spiritual cs-1] — 8/8 ✓ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars?.map((pillar, index) => (
            <div
              key={pillar?.title}
              className={`pillar-card scroll-reveal scroll-reveal-delay-${Math.min(index + 1, 6)}`}
            >
              <div className="text-3xl mb-4" role="img" aria-label={pillar?.title}>{pillar?.icon}</div>
              <h3 className="font-serif font-semibold text-lg text-card-foreground mb-2">{pillar?.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{pillar?.description}</p>
            </div>
          ))}
        </div>

        {/* Health Disclaimer */}
        <div className="mt-10 p-4 bg-muted/50 rounded-xl border border-border scroll-reveal">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            <strong className="text-foreground">Health Disclaimer:</strong> The information provided is for educational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional before making changes to your health routine.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mt-10 scroll-reveal">
          <Link
            href="/health-reform"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-200 shadow-md hover:-translate-y-0.5"
          >
            Explore Health Reform
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}