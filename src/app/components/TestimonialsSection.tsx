'use client';

import React, { useEffect, useRef } from 'react';

const testimonials = [
  {
    quote: 'Olivoria Organics changed how my whole family approaches food and wellness. The moringa powder has become a daily staple in our home, and the health guidance we received at their Matasia outlet was practical and encouraging.',
    name: 'Wanjiru Kariuki',
    role: 'Mother of three, Nairobi',
    initial: 'W',
  },
  {
    quote: 'I was skeptical at first, but after my first consultation I felt genuinely heard and supported. The wholistic approach — looking at my whole life, not just symptoms — was exactly what I needed.',
    name: 'Daniel Otieno',
    role: 'Teacher, Kisumu',
    initial: 'D',
  },
  {
    quote: 'The quality of the organic products is exceptional — you can taste the difference. I especially love the herbal tea blend; it has become my evening ritual for winding down after a long day.',
    name: 'Grace Naliaka',
    role: 'Wellness enthusiast, Ngong',
    initial: 'G',
  },
];

export default function TestimonialsSection() {
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

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="scroll-reveal mb-4 flex justify-center">
            <span className="section-label">Testimonials</span>
          </div>
          <h2 className="text-display font-serif font-light italic text-foreground scroll-reveal scroll-reveal-delay-1">
            What Our Community <span className="text-primary">Experiences</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials?.map((t, index) => (
            <div
              key={t?.name}
              className={`bg-card border border-border rounded-2xl p-7 shadow-sm card-hover scroll-reveal scroll-reveal-delay-${index + 1}`}
            >
              {/* Quote mark */}
              <div className="text-accent/30 mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M14.017 21v-3c0-1.105.895-2 2-2h3c.552 0 1-.448 1-1V9c0-.552-.448-1-1-1h-4c-.552 0-1 .448-1 1v2c0 .552-.448 1-1 1h-1V5h10v10c0 3.314-2.686 6-6 6h-2zM5.017 21v-3c0-1.105.895-2 2-2h3c.552 0 1-.448 1-1V9c0-.552-.448-1-1-1h-4c-.552 0-1 .448-1 1v2c0 .552-.448 1-1 1h-1V5h10v10c0 3.314-2.686 6-6 6h-2z" />
                </svg>
              </div>
              <p className="text-card-foreground leading-relaxed italic font-serif mb-6 text-base">{`"${t?.quote}"`}</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold font-serif text-lg flex-shrink-0">
                  {t?.initial}
                </div>
                <div>
                  <div className="font-semibold text-sm text-card-foreground">{t?.name}</div>
                  <div className="text-xs text-muted-foreground">{t?.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}