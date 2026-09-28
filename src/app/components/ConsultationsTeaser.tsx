'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

const WHATSAPP_NUMBER = '254708261674';

export default function ConsultationsTeaser() {
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
      { threshold: 0.1 }
    );
    if (ref?.current) observer?.observe(ref?.current);
    return () => observer?.disconnect();
  }, []);

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hello, I would like to request a health and wellness consultation. Could you please provide more information?');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-primary overflow-hidden relative">
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
              {['General wellness & lifestyle', 'Nutrition and healthy eating', 'Health reform principles', 'Family wellness guidance', 'Follow-up support']?.map((item) =>
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
                onClick={handleWhatsApp}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-primary font-semibold text-sm hover:bg-primary-foreground/90 transition-all duration-200 shadow-md hover:-translate-y-0.5">
                
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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
              Educational consultations do not replace diagnosis or treatment from qualified medical professionals.
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