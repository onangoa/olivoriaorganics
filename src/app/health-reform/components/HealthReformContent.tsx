'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

const pillars = [
{
  id: 'nutrition',
  icon: '🌿',
  title: 'Nutrition',
  subtitle: 'Whole Foods for Whole Health',
  description: 'The food we eat is one of the most powerful influences on our health. A diet centred on whole, plant-rich, minimally processed foods provides the nutrients our bodies were designed to thrive on.',
  tips: [
  'Prioritize whole grains, legumes, fruits, and vegetables',
  'Reduce processed and refined foods',
  'Choose organic where possible to minimize chemical exposure',
  'Eat mindfully — appreciate and enjoy your food',
  'Traditionally, plant-based diets have been associated with lower rates of chronic disease'],

  image: "https://img.rocket.new/generatedImages/rocket_gen_img_186332abc-1770194976644.png",
  imageAlt: 'Colorful array of fresh organic vegetables and fruits arranged beautifully on a natural wooden surface in bright natural light'
},
{
  id: 'exercise',
  icon: '🏃',
  title: 'Exercise',
  subtitle: 'Movement as Medicine',
  description: 'Regular physical activity is essential to maintaining a healthy body and a clear mind. Exercise supports cardiovascular health, mental wellbeing, healthy weight, and energy levels.',
  tips: [
  'Aim for at least 30 minutes of moderate activity most days',
  'Walking in nature combines exercise with fresh air and mental refreshment',
  'Find activities you genuinely enjoy — consistency matters more than intensity',
  'Strength and flexibility training complement aerobic exercise',
  'Even light movement throughout the day makes a meaningful difference'],

  image: "https://images.unsplash.com/photo-1681772591592-3069e76c2968",
  imageAlt: 'Person walking along a peaceful forest trail surrounded by tall green trees in warm morning sunlight'
},
{
  id: 'water',
  icon: '💧',
  title: 'Water',
  subtitle: 'The Foundation of Life',
  description: 'Water is essential to virtually every function in the human body — from digestion and circulation to temperature regulation and detoxification. Most people underestimate how much their health is affected by hydration.',
  tips: [
  'Drink at least 6–8 glasses of pure water daily',
  'Begin each morning with a glass of water before eating',
  'Herbal teas can contribute to daily fluid intake',
  'Reduce sugary drinks, sodas, and excessive caffeine',
  'Listen to your body — thirst is often an early sign of dehydration'],

  image: "https://images.unsplash.com/photo-1692768812956-88453b84efe6",
  imageAlt: 'Clear pure water being poured into a glass with natural green background and soft natural lighting'
},
{
  id: 'sunlight',
  icon: '☀️',
  title: 'Sunlight',
  subtitle: 'Nature\'s Healing Light',
  description: 'Appropriate exposure to natural sunlight is essential for vitamin D synthesis, mood regulation, and healthy sleep-wake cycles. Sunlight has been a cornerstone of natural health approaches for centuries.',
  tips: [
  'Aim for 15–30 minutes of morning sunlight daily',
  'Sunlight exposure supports the body\'s natural vitamin D production',
  'Natural light during the day supports healthy circadian rhythms',
  'Avoid excessive midday sun exposure, especially in summer',
  'Time outdoors in natural light has well-documented mental health benefits'],

  image: "https://images.unsplash.com/photo-1552186120-5aa71f274534",
  imageAlt: 'Warm golden sunlight streaming through a forest canopy onto a peaceful green meadow in early morning'
},
{
  id: 'fresh-air',
  icon: '🌬️',
  title: 'Fresh Air',
  subtitle: 'Breathe Well, Live Well',
  description: 'Clean, fresh air is vital to respiratory health, mental clarity, and overall vitality. Time spent in natural environments — forests, gardens, open spaces — offers unique restorative benefits.',
  tips: [
  'Open windows regularly to improve indoor air quality',
  'Spend time in natural, green environments as often as possible',
  'Deep, intentional breathing can reduce stress and improve focus',
  'Houseplants can contribute to cleaner indoor air',
  'Consider air quality in your home environment — avoid synthetic fragrances and harsh chemicals'],

  image: "https://images.unsplash.com/photo-1661115427583-2f4b768d8e41",
  imageAlt: 'Misty morning forest with tall trees and fresh green undergrowth in soft diffused natural light'
},
{
  id: 'rest',
  icon: '😴',
  title: 'Rest',
  subtitle: 'Renewal Through Rest',
  description: 'Quality sleep and intentional rest are not luxuries — they are biological necessities. During rest, the body repairs, the immune system strengthens, and the mind consolidates learning and emotional processing.',
  tips: [
  'Aim for 7–9 hours of quality sleep each night',
  'Establish consistent sleep and wake times',
  'Create a calming evening routine — reduce screens before bed',
  'A dark, cool, quiet sleeping environment supports deeper sleep',
  'The Sabbath rest, observed weekly, offers a model of intentional, restorative pause'],

  image: "https://images.unsplash.com/photo-1698321014601-5bea6d5ffef6",
  imageAlt: 'Peaceful bedroom with white linen, soft natural light through curtains, and a serene calm atmosphere'
},
{
  id: 'temperance',
  icon: '⚖️',
  title: 'Temperance',
  subtitle: 'Balance in All Things',
  description: 'Temperance means moderation in all that is good and abstinence from all that is harmful. It is the wisdom to know the difference and the discipline to act accordingly — a cornerstone of sustainable wellness.',
  tips: [
  'Avoid tobacco, alcohol, and recreational substances',
  'Moderate caffeine and sugar intake',
  'Balance work and rest — overwork is as damaging as underwork',
  'Practice moderation with technology and screen time',
  'Temperance extends to thoughts and emotions — cultivate peace of mind'],

  image: "https://images.unsplash.com/photo-1634642975579-e7f2d300a0c1",
  imageAlt: 'Serene balanced stones stacked by a calm river in peaceful natural surroundings with soft green light'
},
{
  id: 'spiritual-wellbeing',
  icon: '✝️',
  title: 'Spiritual Wellbeing',
  subtitle: 'Wholeness from the Inside Out',
  description: 'True wholistic health encompasses the spiritual dimension. A living connection with God brings peace, purpose, and inner resilience that no physical remedy can provide. Faith, hope, and love are powerful health forces.',
  tips: [
  'Cultivate a daily practice of prayer and reflection',
  'Engage with Scripture and uplifting, life-giving content',
  'Community and belonging are essential to spiritual and emotional health',
  'Gratitude and forgiveness have measurable positive effects on wellbeing',
  'Trust in God\'s care offers a foundation of peace that transcends circumstances'],

  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1125e445d-1772195188050.png",
  imageAlt: 'Person sitting quietly in peaceful natural outdoor setting with hands folded in prayer surrounded by soft green nature'
}];


export default function HealthReformContent() {
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
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );
    if (ref?.current) observer?.observe(ref?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <div ref={ref} className="pt-24 pb-20">
      {/* Page Header */}
      <div className="bg-muted/30 border-b border-border py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label scroll-reveal">Education</span>
          <h1 className="text-display font-serif font-light italic text-foreground mt-4 scroll-reveal scroll-reveal-delay-1">
            The 8 Pillars of<br />
            <span className="text-primary">Health Reform</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed scroll-reveal scroll-reveal-delay-2">
            Health reform is the intentional return to the principles God designed for human flourishing. These eight foundational pillars — drawn from both Scripture and science — form the basis of a truly wholistic approach to health and life.
          </p>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="sticky top-16 lg:top-20 z-30 bg-background/95 backdrop-blur-sm border-b border-border py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {pillars?.map((pillar) =>
            <a
              key={pillar?.id}
              href={`#${pillar?.id}`}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground border border-border hover:border-primary/40 hover:text-primary transition-colors bg-card">
              
                <span>{pillar?.icon}</span>
                {pillar?.title}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pillars */}
        {pillars?.map((pillar, index) =>
        <section
          key={pillar?.id}
          id={pillar?.id}
          className={`py-16 lg:py-20 border-b border-border ${index === pillars?.length - 1 ? 'border-b-0' : ''}`}>
          
            <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              {/* Text - alternates sides */}
              <div className={`space-y-5 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="scroll-reveal">
                  <span className="section-label">
                    <span>{pillar?.icon}</span>
                    Pillar {index + 1}
                  </span>
                </div>
                <div className="scroll-reveal scroll-reveal-delay-1">
                  <h2 className="text-headline font-serif font-light italic text-foreground">
                    {pillar?.title}
                  </h2>
                  <p className="text-secondary font-medium mt-1">{pillar?.subtitle}</p>
                </div>
                <p className="text-muted-foreground leading-relaxed scroll-reveal scroll-reveal-delay-2">{pillar?.description}</p>
                <div className="space-y-2.5 scroll-reveal scroll-reveal-delay-3">
                  {pillar?.tips?.map((tip) =>
                <div key={tip} className="flex items-start gap-3 text-sm text-foreground">
                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span className="text-muted-foreground">{tip}</span>
                    </div>
                )}
                </div>
              </div>

              {/* Image */}
              <div className={`scroll-reveal scroll-reveal-delay-1 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ aspectRatio: '4/3' }}>
                  <AppImage
                  src={pillar?.image}
                  alt={pillar?.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw" />
                
                  {/* Pillar number overlay */}
                  <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-xl px-3 py-2">
                    <span className="text-3xl" role="img" aria-label={pillar?.title}>{pillar?.icon}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Health Disclaimer */}
        <div className="py-10 border-t border-border">
          <div className="bg-muted/50 rounded-xl border border-border p-6 max-w-3xl mx-auto">
            <h3 className="font-semibold text-foreground text-sm mb-2">Health Disclaimer</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The information on this page is provided for educational purposes only and reflects general wellness principles rooted in wholistic health traditions. It does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making significant changes to your diet, exercise routine, or health practices, particularly if you have existing medical conditions or are taking medication.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="py-10 text-center">
          <h2 className="text-headline font-serif font-light italic text-foreground mb-4 scroll-reveal">
            Ready to Begin Your <span className="text-primary">Wellness Journey?</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto scroll-reveal scroll-reveal-delay-1">
            Explore our organic products or request a personalized consultation to take your first practical steps toward wholistic health.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center scroll-reveal scroll-reveal-delay-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-200 shadow-md hover:-translate-y-0.5">
              
              Explore Our Products
            </Link>
            <Link
              href="/consultations"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/5 transition-colors">
              
              Request a Consultation
            </Link>
          </div>
        </div>
      </div>
    </div>);

}