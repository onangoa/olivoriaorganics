'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

export default function AboutContent() {
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
    if (ref?.current) observer?.observe(ref?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <div ref={ref} className="pt-24 pb-20">
      {/* Page Header */}
      <div className="bg-muted/30 border-b border-border py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label scroll-reveal">About Us</span>
          <h1 className="text-display font-serif font-light italic text-foreground mt-4 scroll-reveal scroll-reveal-delay-1">
            Rooted in Nature,<br />
            <span className="text-primary">Guided by Faith</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed scroll-reveal scroll-reveal-delay-2">
            We exist to help individuals and families discover the profound connection between wholistic living and lasting wellbeing.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Our Story */}
        <section className="py-16 lg:py-20 border-b border-border">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="scroll-reveal">
              <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ aspectRatio: '4/3' }}>
                <AppImage
                  src="https://img.rocket.new/generatedImages/rocket_gen_img_18edcdae1-1766563254553.png"
                  alt="Lush organic garden with vibrant green plants and natural sunlight filtering through leaves in a serene outdoor setting"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            </div>
            <div className="space-y-5">
              <div className="scroll-reveal"><span className="section-label">Our Story</span></div>
              <h2 className="text-headline font-serif font-light italic text-foreground scroll-reveal scroll-reveal-delay-1">
                Why Olivoria Organics Exists
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed scroll-reveal scroll-reveal-delay-2">
                <p>Olivoria Organics is a natural wellness food store outlet offering authentic plant-based remedies, plant extracts, teas, spices, and oils among other holistic health products.</p>
                <p>Our bearing towards delivering a natural healthy living is holistically founded as the core principle of life. We believe that God's original design for humanity includes vibrant physical, mental, and spiritual wellbeing — and we are committed to making that vision accessible to every individual and family we serve.</p>
                <p>Our name reflects our roots — drawn from the olive tree, a symbol of peace, healing, and enduring life. We are committed to offering products and knowledge that truly nourish.</p>
              </div>

              {/* Location & Hours */}
              <div className="mt-6 space-y-5 scroll-reveal scroll-reveal-delay-3">
                {/* Location */}
                <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
                  <span className="text-2xl mt-0.5">📍</span>
                  <div>
                    <div className="font-serif font-semibold text-foreground text-sm mb-0.5">Our Location</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Matasia, along Kiserian–Matasia Road<br />
                      Moran Towers, Matasia
                    </p>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
                  <span className="text-2xl mt-0.5">🕐</span>
                  <div className="w-full">
                    <div className="font-serif font-semibold text-foreground text-sm mb-2">Opening Hours</div>
                    <div className="space-y-1 text-sm">
                      {[
                        { day: 'Monday – Thursday', hours: '9:00 AM – 7:30 PM' },
                        { day: 'Friday', hours: '9:00 AM – 3:00 PM' },
                        { day: 'Saturday', hours: 'Closed', closed: true },
                        { day: 'Sunday', hours: '9:00 AM – 6:30 PM' },
                      ]?.map((item) => (
                        <div key={item?.day} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                          <span className="text-muted-foreground">{item?.day}</span>
                          <span className={`font-medium ${item?.closed ? 'text-red-500' : 'text-foreground'}`}>
                            {item?.hours}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Approach */}
        <section className="py-16 border-b border-border">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Our Mission',
                text: 'At Olivoria Organics, our mission is to promote a natural, healthy lifestyle and wellness rooted in biblical principles. We achieve this by providing carefully selected, pure, and high-quality herbs alongside other plant-based supplies that support the physical, mental, and spiritual well-being of the body.'
              },
              {
                icon: '🌱',
                title: 'Our Vision',
                text: "To empower individuals to reclaim their holistic vitality through Nature's way of life. We envision a world where people are educated on how to integrate plant-based remedies and whole foods to completely restore the body as a temple, according to God's original design."
              },
              {
                icon: '💚',
                title: 'Our Approach',
                text: 'We believe health is a whole-person journey. We address the physical, mental, emotional, social, and spiritual dimensions — offering practical tools, not just products.'
              }
            ]?.map((item, i) =>
              <div key={item?.title} className={`bg-card border border-border rounded-2xl p-7 scroll-reveal scroll-reveal-delay-${i + 1}`}>
                <div className="text-3xl mb-4">{item?.icon}</div>
                <h3 className="font-serif font-semibold text-lg text-card-foreground mb-3">{item?.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item?.text}</p>
              </div>
            )}
          </div>
        </section>

        {/* Founder */}
        <section className="py-16 border-b border-border">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-5">
              <div className="scroll-reveal"><span className="section-label">Our Founder</span></div>
              <h2 className="text-headline font-serif font-light italic text-foreground scroll-reveal scroll-reveal-delay-1">
                Meet the Heart Behind Olivoria Organics
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed scroll-reveal scroll-reveal-delay-2">
                <p>With a background in health education and a passion for natural living, our founder established Olivoria Organics out of a desire to make wholistic wellness accessible and practical for everyday families.</p>
                <p>Having personally experienced the transformation that comes from embracing natural, whole-food nutrition and a principled lifestyle, she wanted to create a space where others could access quality organic products alongside the guidance to use them effectively.</p>
                <p>Her approach is warm, non-judgmental, and deeply rooted in the belief that every person has the potential to experience greater health and vitality — regardless of where they are starting from.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 scroll-reveal scroll-reveal-delay-3">
                {['Health Education', 'Wholistic Wellness', 'Nutrition Guidance', 'Lifestyle Coaching']?.map((qual) =>
                  <div key={qual} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    {qual}
                  </div>
                )}
              </div>
            </div>
            <div className="scroll-reveal scroll-reveal-delay-1">
              <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ aspectRatio: '3/4' }}>
                <AppImage
                  src="https://img.rocket.new/generatedImages/rocket_gen_img_14a32fed0-1772261238759.png"
                  alt="Professional wellness practitioner smiling warmly in a natural, bright consultation space surrounded by plants and natural light"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
              <div className="mt-4 bg-card border border-border rounded-xl p-5">
                <div className="font-serif font-semibold text-foreground">Founder & Wellness Practitioner</div>
                <div className="text-sm text-muted-foreground mt-1">Olivoria Organics</div>
              </div>
            </div>
          </div>
        </section>

        {/* Faith & Values */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="scroll-reveal mb-4 flex justify-center"><span className="section-label">Faith & Values</span></div>
            <h2 className="text-headline font-serif font-light italic text-foreground scroll-reveal scroll-reveal-delay-1">
              A Foundation of <span className="text-primary">Faith & Wholistic Living</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed mt-6 scroll-reveal scroll-reveal-delay-2">
              <p>Olivoria Organics is grounded in a Christian and Seventh-day Adventist understanding of wholistic health — the belief that true wellness encompasses the whole person: body, mind, and spirit.</p>
              <p>We draw on a rich tradition of health reform that has, for over a century, emphasized the profound relationship between lifestyle and wellbeing. This includes plant-rich nutrition, regular exercise, adequate rest, time in nature, and the importance of spiritual connection with God.</p>
              <p>We welcome everyone — regardless of background or belief — to explore wholistic wellness with us. Our faith informs our values and our care for people, but we serve all who seek greater health and vitality with warmth and respect.</p>
            </div>

            {/* Faith Quotes */}
            <div className="mt-10 space-y-6 scroll-reveal scroll-reveal-delay-3">
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-7 text-left relative">
                <div className="text-primary text-5xl font-serif leading-none mb-3 opacity-40">&ldquo;</div>
                <blockquote className="text-foreground font-serif italic text-base leading-relaxed">
                  Christ is the only answer to every disease and the sin problems of man. To them who are sick, Christ said, &ldquo;Behold, I will bring it health and cure, and will cure them, and will reveal unto them the abundance of peace and truth.&rdquo;
                </blockquote>
              </div>

              <div className="bg-muted/40 border border-border rounded-2xl p-7 text-left relative">
                <div className="text-primary text-5xl font-serif leading-none mb-3 opacity-40">&ldquo;</div>
                <blockquote className="text-foreground font-serif italic text-base leading-relaxed mb-4">
                  It is not a denial of faith to use such remedies as God has provided to alleviate pain and to aid nature in her work of restoration. It is no denial of faith for the sick who request prayer for healing to cooperate with God, and place themselves in the condition most favorable to recovery. God has put it in our power to obtain a knowledge of the laws of life. This knowledge has been placed within our reach for use. We should employ every facility for the restoration of health, taking every advantage possible, working in harmony with natural laws.
                </blockquote>
                <cite className="text-sm text-muted-foreground not-italic font-medium">— 2 SM 286.1</cite>
              </div>
            </div>

            {/* Core Values */}
            <div className="mt-10 scroll-reveal scroll-reveal-delay-4">
              <h3 className="font-serif font-semibold text-xl text-foreground mb-6">Our Core Values</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { icon: '🕊️', title: 'Integrity', desc: 'We are committed to uphold high ethical standards of product within the rich of our clientele.' },
                  { icon: '💡', title: 'Innovative', desc: 'We solve your ill health issue in a remarkable manner that fits you.' },
                  { icon: '📋', title: 'Accountability', desc: 'We will guide and deliver proper dictates which will support a health body framework.' },
                  { icon: '🤝', title: 'Customer Centricity', desc: 'We listen to your needs, understand your need and deliver your need.' },
                  { icon: '⭐', title: 'Professionalism', desc: 'We choose good and favourable standard of product vs service for you.' }
                ]?.map((val) =>
                  <div key={val?.title} className="bg-card border border-border rounded-xl p-5 text-left">
                    <div className="text-2xl mb-2">{val?.icon}</div>
                    <div className="font-serif font-semibold text-foreground mb-1">{val?.title}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{val?.desc}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 scroll-reveal scroll-reveal-delay-5">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-200 shadow-md hover:-translate-y-0.5">
                Get In Touch With Us
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
