'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

const WHATSAPP_NUMBER = '27000000000';

const featuredProducts = [
{
  id: 'organic-moringa-powder',
  name: 'Organic Moringa Powder',
  category: 'Natural Supplements',
  description: 'Traditionally used to support energy and nutritional wellbeing. Rich in vitamins, minerals, and antioxidants.',
  price: 'R 185',
  availability: 'In Stock',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c760dfda-1784615633062.png",
  alt: 'Green moringa powder in a wooden bowl surrounded by fresh moringa leaves on a light cream background'
},
{
  id: 'rooibos-wellness-tea',
  name: 'Rooibos Wellness Tea',
  category: 'Herbal Teas',
  description: 'South African rooibos blended with chamomile and lavender. May support relaxation and restful sleep.',
  price: 'R 120',
  availability: 'In Stock',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1ead2fd92-1780244500039.png",
  alt: 'Warm cup of rooibos herbal tea with dried flowers and leaves on a wooden tray in soft natural light'
},
{
  id: 'cold-pressed-coconut-oil',
  name: 'Cold-Pressed Coconut Oil',
  category: 'Organic Foods',
  description: 'Unrefined, virgin coconut oil. Part of a healthy lifestyle for cooking and natural personal care.',
  price: 'R 210',
  availability: 'In Stock',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_154257613-1772368886880.png",
  alt: 'Glass jar of clear cold-pressed coconut oil with fresh coconut halves on a clean white surface'
},
{
  id: 'organic-turmeric-blend',
  name: 'Organic Turmeric Blend',
  category: 'Herbs & Botanicals',
  description: 'Whole-food turmeric combined with black pepper for enhanced absorption. Traditionally used for general wellness.',
  price: 'R 155',
  availability: 'In Stock',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_12d768334-1766740607394.png",
  alt: 'Vibrant yellow turmeric powder and fresh turmeric root arranged on a wooden surface with warm earthy tones'
},
{
  id: 'organic-hemp-seeds',
  name: 'Organic Hemp Seeds',
  category: 'Organic Seeds',
  description: 'Hulled organic hemp seeds. A complete plant protein source, excellent for smoothies and salads.',
  price: 'R 175',
  availability: 'In Stock',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1e74044d8-1772057607386.png",
  alt: 'Small bowl of organic hemp seeds on a natural linen cloth with green plants in the soft-focus background'
},
{
  id: 'aloe-vera-gel',
  name: 'Pure Aloe Vera Gel',
  category: 'Natural Personal Care',
  description: 'Certified organic aloe vera gel. Traditionally used to support skin health and soothing care.',
  price: 'R 135',
  availability: 'In Stock',
  image: "https://images.unsplash.com/photo-1485077266967-bc48091c0ea2",
  alt: 'Fresh aloe vera plant with clear gel on a bright white background in clean natural setting'
}];


export default function FeaturedProducts() {
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
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const handleWhatsApp = (productName: string) => {
    const message = encodeURIComponent(`Hello, I would like to enquire about ${productName}. Could you please provide more information about availability and price?`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="scroll-reveal mb-4">
              <span className="section-label">Our Products</span>
            </div>
            <h2 className="text-display font-serif font-light italic text-foreground scroll-reveal scroll-reveal-delay-1">
              Featured <span className="text-primary">Organic Products</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl scroll-reveal scroll-reveal-delay-2">
              Carefully selected organic and natural products to support your wholistic wellness journey.
            </p>
          </div>
          <Link
            href="/products"
            className="scroll-reveal flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 transition-colors">
            
            View All Products
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product, index) =>
          <article
            key={product.id}
            className={`product-card scroll-reveal scroll-reveal-delay-${Math.min(index + 1, 6)}`}>
            
              {/* Image */}
              <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <AppImage
                src={product.image}
                alt={product.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              
                {/* Category badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-block px-2.5 py-1 bg-background/90 backdrop-blur-sm text-xs font-medium text-primary rounded-full border border-primary/20">
                    {product.category}
                  </span>
                </div>
                {/* Availability */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50/90 backdrop-blur-sm text-xs font-medium text-green-700 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    {product.availability}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col gap-3">
                <h3 className="font-serif font-semibold text-lg text-card-foreground leading-snug">{product.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between mt-1">
                  <span className="font-semibold text-primary text-lg">{product.price}</span>
                  <Link
                  href={`/products`}
                  className="text-xs font-semibold text-primary underline underline-offset-2 hover:text-primary/70 transition-colors">
                  
                    View Details
                  </Link>
                </div>

                <button
                onClick={() => handleWhatsApp(product.name)}
                className="whatsapp-btn flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold mt-1">
                
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Enquire on WhatsApp
                </button>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>);

}