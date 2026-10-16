'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import ConsultationFormModal from '@/components/ConsultationFormModal';

export default function ConsultationsTeaser() {
  const ref = useRef<HTMLElement>(null);
  const [formOpen, setFormOpen] = useState(false);

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
      { threshold: 0.1 }
    );
    if (ref?.current) observer?.observe(ref?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-primary overflow-hidden relative">
      <ConsultationFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none opacity-10" aria-hidden="true">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="flex flex-col gap-6">
            <div className="scroll-reveal">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground/70 border border-primary-foreground/20 rounded-full px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/60 inline-block" />
                Personalized Guidance
              </span>
            </div>
            <h2 className="text-display font-serif font-light italic text-primary-foreground scroll-reveal scroll-reveal-delay-1">
              Personalized Health & Wellness Guidance
            </h2>
            <p className="text-primary-foreground/80 leading-relaxed scroll-reveal scroll-reveal-delay-2">
              Seek individualized guidance relating to healthy lifestyle choices, nutrition, wellness, and health reform. Our consultations are designed to meet you where you are and help you take meaningful steps toward wholistic wellbeing.
            </p>
            <ul className="space-y-3 scroll-reveal scroll-reveal-delay-3">
              {['General wellness & lifestyle', 'Nutrition and healthy eating', 'Disease management support', 'Palliative care support', 'Health reform principles', 'Family wellness guidance', 'Follow-up support']?.map((item) =>
              <li key={item} className="flex items-center gap-3 text-primary-foreground/80 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  {item}
                </li>
              )}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4 scroll-reveal scroll-reveal-delay-4">
              <button
                onClick={() => setFormOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-primary font-semibold text-sm hover:bg-primary-foreground/90 transition-all duration-200 shadow-md hover:-translate-y-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Request a Consultation
              </button>
              <Link
                href="/consultations"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-primary-foreground/30 text-primary-foreground font-semibold text-sm hover:bg-primary-foreground/10 transition-all duration-200">
                
                Learn About Consultations
              </Link>
            </div>
            <p className="text-xs text-primary-foreground/50 scroll-reveal">
              Educational consultations do not replace diagnosis or treatment.
            </p>
          </div>

          {/* Image */}
          <div className="scroll-reveal scroll-reveal-delay-2">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ aspectRatio: '4/3' }}>
              <AppImage
                src="https://img.rocket.new/generatedImages/rocket_gen_img_1b186d424-1772295342532.png"
                alt="Wellness consultation setting with natural herbs, fresh vegetables, and health materials on a clean wooden table in warm natural light"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>);

}