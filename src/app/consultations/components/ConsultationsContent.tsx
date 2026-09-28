'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';

const WHATSAPP_NUMBER = '27000000000';

const faqs = [
{
  q: 'What happens during a consultation?',
  a: 'During a consultation, we take time to understand your current lifestyle, health goals, and challenges. We discuss practical, evidence-informed strategies for improving your nutrition, activity, rest, and overall wellbeing — always from a wholistic perspective.'
},
{
  q: 'Is this a replacement for medical care?',
  a: 'No. Our consultations are educational and wellness-focused. They do not constitute medical diagnosis, treatment, or prescription. We always encourage you to work alongside qualified healthcare professionals for any medical concerns.'
},
{
  q: 'Who can benefit from a consultation?',
  a: 'Anyone who wants to make meaningful improvements to their lifestyle and wellbeing. Whether you are just beginning your wellness journey, looking to refine your nutrition, or seeking guidance on health reform principles — we can help.'
},
{
  q: 'How do I book a consultation?',
  a: 'Simply reach out via WhatsApp or our contact form. We will arrange a suitable time and format (in-person or virtual) that works for you.'
},
{
  q: 'How much does a consultation cost?',
  a: 'Consultation fees vary depending on the type and duration. Please contact us via WhatsApp for current pricing and available packages.'
},
{
  q: 'Are follow-up consultations available?',
  a: 'Yes. We offer follow-up sessions to support your ongoing progress and help you stay accountable to your wellness goals.'
}];


const areas = [
{ icon: '🥗', title: 'Nutrition & Healthy Eating', desc: 'Whole-food, plant-rich dietary guidance tailored to your needs and goals.' },
{ icon: '🏃', title: 'Lifestyle & Activity', desc: 'Practical strategies for incorporating regular movement into daily life.' },
{ icon: '😴', title: 'Rest & Recovery', desc: 'Guidance on improving sleep quality and incorporating restorative rest.' },
{ icon: '💧', title: 'Hydration & Detox', desc: 'Understanding the role of water and natural cleansing approaches.' },
{ icon: '🌿', title: 'Health Reform Principles', desc: 'Introduction to the eight foundational principles of wholistic health.' },
{ icon: '👨‍👩‍👧', title: 'Family Wellness', desc: 'Whole-family approaches to healthier living, including children\'s nutrition.' }];


export default function ConsultationsContent() {
  const ref = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hello, I would like to request a health and wellness consultation with OlivoriaOrganics. Could you please provide more information?');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => prev === index ? null : index);
  };

  return (
    <div ref={ref} className="pt-24 pb-20">
      {/* Page Header */}
      <div className="bg-primary overflow-hidden relative py-16 lg:py-24">
        <div className="absolute inset-0 pointer-events-none opacity-10" aria-hidden="true">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)' }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground/70 border border-primary-foreground/20 rounded-full px-3 py-1.5 mb-6 scroll-reveal">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/60 inline-block" />
            Personalized Guidance
          </span>
          <h1 className="text-display font-serif font-light italic text-primary-foreground mt-2 scroll-reveal scroll-reveal-delay-1">
            Health & Wellness<br />Consultations
          </h1>
          <p className="text-primary-foreground/80 mt-4 max-w-xl mx-auto leading-relaxed scroll-reveal scroll-reveal-delay-2">
            Individualized guidance for healthy lifestyle choices, nutrition, wellness, and health reform — rooted in wholistic principles and genuine care.
          </p>
          <div className="mt-8 scroll-reveal scroll-reveal-delay-3">
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-primary font-semibold text-sm hover:bg-primary-foreground/90 transition-all duration-200 shadow-lg hover:-translate-y-0.5">
              
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Request a Consultation
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* What it involves */}
        <section className="py-16 border-b border-border">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <div className="scroll-reveal"><span className="section-label">What to Expect</span></div>
              <h2 className="text-headline font-serif font-light italic text-foreground scroll-reveal scroll-reveal-delay-1">
                A Wholistic Conversation<br />About Your Health
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed scroll-reveal scroll-reveal-delay-2">
                <p>Our consultations are warm, unhurried conversations designed to help you understand your health more clearly and make meaningful changes to your lifestyle.</p>
                <p>We take time to listen — to your goals, your challenges, your current habits, and your lifestyle. We then offer practical, wholistic guidance drawn from evidence-informed health reform principles.</p>
                <p>Every person is unique, and so is every consultation. We don't offer generic prescriptions — we offer personalized encouragement and education tailored to your specific situation.</p>
              </div>
              <div className="space-y-3 scroll-reveal scroll-reveal-delay-3">
                {['Initial lifestyle and wellness assessment', 'Personalized nutritional guidance', 'Health reform principle education', 'Practical lifestyle recommendations', 'Product recommendations where relevant', 'Follow-up support available'].map((item) =>
                <div key={item} className="flex items-center gap-3 text-sm text-foreground">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    {item}
                  </div>
                )}
              </div>
            </div>
            <div className="scroll-reveal scroll-reveal-delay-1">
              <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ aspectRatio: '4/3' }}>
                <AppImage
                  src="https://img.rocket.new/generatedImages/rocket_gen_img_1031beb16-1772146032935.png"
                  alt="Warm wellness consultation setting with natural herbs, fresh produce, and health materials on a wooden table in bright natural light"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw" />
                
              </div>
            </div>
          </div>
        </section>

        {/* Areas Covered */}
        <section className="py-16 border-b border-border">
          <div className="text-center mb-12">
            <div className="scroll-reveal mb-4 flex justify-center"><span className="section-label">Areas We Cover</span></div>
            <h2 className="text-headline font-serif font-light italic text-foreground scroll-reveal scroll-reveal-delay-1">
              Topics We Can <span className="text-primary">Explore Together</span>
            </h2>
          </div>
          {/* BENTO: 6 cards, 3 cols desktop, 2 tablet, 1 mobile — 6/6 ✓ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {areas.map((area, i) =>
            <div key={area.title} className={`bg-card border border-border rounded-2xl p-6 card-hover scroll-reveal scroll-reveal-delay-${Math.min(i + 1, 6)}`}>
                <div className="text-3xl mb-3">{area.icon}</div>
                <h3 className="font-serif font-semibold text-base text-card-foreground mb-2">{area.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{area.desc}</p>
              </div>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 border-b border-border">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: CTA card */}
            <div className="scroll-reveal">
              <div className="bg-muted/50 border border-border rounded-2xl p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-3">Ready to Start Your Wellness Journey?</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    Reach out via WhatsApp to arrange your consultation. We'll find a time and format that works for you — in-person or virtual.
                  </p>
                  <button
                    onClick={handleWhatsApp}
                    className="whatsapp-btn inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm">
                    
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Book via WhatsApp
                  </button>
                </div>
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Disclaimer:</strong> OlivoriaOrganics wellness consultations are educational in nature and do not constitute medical diagnosis, treatment, or prescription. Always consult a qualified healthcare professional for medical concerns.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: FAQ Accordion */}
            <div className="scroll-reveal scroll-reveal-delay-1 space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
              {faqs.map((faq, index) =>
              <div key={index} className="bg-card border border-border rounded-xl overflow-hidden">
                  <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-inset"
                  aria-expanded={openFaq === index}>
                  
                    <span className="text-sm font-semibold text-card-foreground pr-4">{faq.q}</span>
                    <span
                    className="text-muted-foreground flex-shrink-0 transition-transform duration-300"
                    style={{ transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    aria-hidden="true">
                    
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </button>
                  <div
                  className="faq-content"
                  style={{ maxHeight: openFaq === index ? '300px' : '0px', opacity: openFaq === index ? 1 : 0 }}>
                  
                    <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>);

}