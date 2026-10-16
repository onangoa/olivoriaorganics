'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import ConsultationFormModal from '@/components/ConsultationFormModal';

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
  q: 'What is disease management support?',
  a: 'Disease management support is educational, lifestyle-centred guidance for people living with chronic conditions such as type 2 diabetes, high blood pressure, or arthritis. We help you build supportive daily habits around nutrition, movement, rest, and stress — always working alongside your doctor or healthcare team, never in place of them.'
},
{
  q: 'What does palliative care support involve?',
  a: 'Our palliative care support focuses on comfort, dignity, and quality of life for individuals and families navigating serious illness. We offer gentle, wholistic guidance — nourishing foods, restful routines, calming environments, and emotional and spiritual encouragement — as a complement to the medical care you receive from your healthcare providers.'
},
{
  q: 'Who can benefit from a consultation?',
  a: 'Anyone who wants to make meaningful improvements to their lifestyle and wellbeing. Whether you are just beginning your wellness journey, looking to refine your nutrition, living with a chronic condition, or seeking guidance on health reform principles — we can help.'
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
{ icon: '👨‍👩‍👧', title: 'Family Wellness', desc: 'Whole-family approaches to healthier living, including children\'s nutrition.' },
{ icon: '🩺', title: 'Disease Management Support', desc: 'Wholistic lifestyle guidance for those living with chronic conditions — always alongside your medical team.' },
{ icon: '🕊️', title: 'Palliative Care Support', desc: 'Compassionate, comfort-focused guidance for individuals and families navigating serious illness.' }];


export default function ConsultationsContent() {
  const ref = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);

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

  // Auto-open the booking form when arriving via a "Book Consultation" link
  // (e.g. /consultations?book=1).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('book') === '1') setFormOpen(true);
  }, []);

  const openForm = () => setFormOpen(true);
  const closeForm = () => setFormOpen(false);

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
            Individualized guidance for healthy lifestyle choices, nutrition, wellness, and health reform — including disease management and palliative care support — rooted in wholistic principles and genuine care.
          </p>
          <div className="mt-8 scroll-reveal scroll-reveal-delay-3">
            <button
              onClick={openForm}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-primary font-semibold text-sm hover:bg-primary-foreground/90 transition-all duration-200 shadow-lg hover:-translate-y-0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                  src="/assets/images/1b186d424-1772295342532.jpg"
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
          {/* BENTO: 8 cards, 3 cols desktop, 2 tablet, 1 mobile */}
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

        {/* Disease Management & Palliative Care */}
        <section className="py-16 border-b border-border">
          <div className="text-center mb-12">
            <div className="scroll-reveal mb-4 flex justify-center"><span className="section-label">Compassionate Support</span></div>
            <h2 className="text-headline font-serif font-light italic text-foreground scroll-reveal scroll-reveal-delay-1">
              Disease Management & <span className="text-primary">Palliative Care Support</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed scroll-reveal scroll-reveal-delay-2">
              Living with a chronic or serious illness affects the whole person — and the whole family. Our wholistic support walks alongside your medical care, focusing on daily habits, comfort, and quality of life.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-8 card-hover scroll-reveal">
              <div className="text-4xl mb-4">🩺</div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">Disease Management Support</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                If you are living with a chronic condition such as type 2 diabetes, high blood pressure, or arthritis, small daily choices can make a meaningful difference. We help you build a supportive lifestyle around your doctor's treatment plan — never in place of it.
              </p>
              <div className="space-y-2.5">
                {['Nutrition guidance tailored to your condition', 'Gentle, appropriate movement and activity ideas', 'Rest, sleep, and stress-reduction strategies', 'Practical habit-setting with follow-up support', 'Coordination-friendly notes you can share with your doctor'].map((item) =>
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

            <div className="bg-card border border-border rounded-2xl p-8 card-hover scroll-reveal scroll-reveal-delay-1">
              <div className="text-4xl mb-4">🕊️</div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">Palliative Care Support</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                For individuals and families navigating serious illness, our focus shifts to comfort, dignity, and peace. We provide a calm, compassionate presence and gentle wholistic guidance that complements the care you receive from your medical team.
              </p>
              <div className="space-y-2.5">
                {['Comfort-centred nutrition and gentle nourishment', 'Calming routines and restful environments', 'Emotional and spiritual encouragement', 'Respite and self-care guidance for caregivers', 'Whole-family support through difficult seasons'].map((item) =>
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
          </div>

          <div className="mt-6 p-5 bg-muted/50 rounded-xl border border-border scroll-reveal">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              <strong className="text-foreground">Important:</strong> Disease management and palliative care support at Olivoria Organics is educational and wholistic in nature. It does not include medical diagnosis, treatment, prescription, or medication management. Please always follow the guidance of your qualified healthcare professionals. If you are experiencing a medical emergency, contact your doctor or emergency services immediately.
            </p>
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
                    Fill in the booking form and we'll get back to you to arrange your consultation — in-person or virtual.
                  </p>
                  <button
                    onClick={openForm}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Book a Consultation
                  </button>
                </div>
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Disclaimer:</strong> Olivoria Organics wellness consultations are educational in nature and do not constitute medical diagnosis.
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

      {/* Consultation Booking Form Modal */}
      <ConsultationFormModal open={formOpen} onClose={closeForm} />
    </div>);

}