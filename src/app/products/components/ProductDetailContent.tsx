'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { formatKES } from '@/lib/money';
import type { Product } from '@/lib/content';

const WHATSAPP_NUMBER = '254708261674';

interface ProductDetailContentProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailContent({
  product,
  relatedProducts,
}: ProductDetailContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target
              .querySelectorAll('.scroll-reveal')
              .forEach((el) => el.classList.add('revealed'));
          }
        });
      },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hello, I would like to enquire about ${product.name}. Could you please provide more information about availability and price?`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const bullet = (item: React.ReactNode, key: React.Key) => (
    <li key={key} className="flex items-start gap-3 text-sm text-foreground">
      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      {item}
    </li>
  );

  return (
    <div ref={ref} className="pt-24 pb-20">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="scroll-reveal">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/70 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Products
          </Link>
        </div>

        {/* Product Header */}
        <header className="mt-6 mb-10">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground scroll-reveal">
            <span className="text-accent font-medium uppercase tracking-wide">
              {product.category}
            </span>
            <span aria-hidden="true">•</span>
            <span className="inline-flex items-center gap-1 text-green-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              {product.type === 'service' ? 'Bookable session' : product.availability}
            </span>
          </div>
          <h1 className="text-display font-serif font-light italic text-foreground mt-4 leading-tight scroll-reveal scroll-reveal-delay-1">
            {product.name}
          </h1>
          <p className="text-muted-foreground mt-5 leading-relaxed text-base lg:text-lg scroll-reveal scroll-reveal-delay-2">
            {product.longDescription ?? product.description}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6 scroll-reveal scroll-reveal-delay-3">
            <span className="font-serif font-semibold text-2xl text-primary">
              {product.variants.length > 1
                ? `From ${formatKES(product.price)}`
                : formatKES(product.price)}
            </span>
            {product.variants.length > 1 && (
              <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {product.variants.map((variant) => (
                  <span key={variant.label}>
                    {variant.label} —{' '}
                    <span className="font-semibold text-foreground">
                      {formatKES(variant.price)}
                    </span>
                  </span>
                ))}
              </span>
            )}
            <button
              onClick={handleWhatsApp}
              className="whatsapp-btn inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Enquire on WhatsApp
            </button>
          </div>
        </header>

        {/* Hero Image */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-xl scroll-reveal"
          style={{ aspectRatio: '16/9' }}
        >
          <AppImage
            src={product.image}
            alt={product.alt}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        {/* Photo Gallery */}
        {product.gallery && product.gallery.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 scroll-reveal">
            {product.gallery.map((photo, i) => (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden border border-border"
                style={{ aspectRatio: '4/3' }}
              >
                <AppImage
                  src={photo}
                  alt={`${product.alt} — photo ${i + 2}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        )}

        {/* Product Body */}
        <div className="mt-12 space-y-10">
          {product.highlights && product.highlights.length > 0 && (
            <section className="scroll-reveal">
              <h2 className="font-serif font-semibold text-xl lg:text-2xl text-foreground mb-4">
                Why Choose {product.name}
              </h2>
              <ul className="space-y-3">{product.highlights.map((item, i) => bullet(item, i))}</ul>
            </section>
          )}

          {product.nutrition && product.nutrition.length > 0 && (
            <section className="scroll-reveal">
              <h2 className="font-serif font-semibold text-xl lg:text-2xl text-foreground mb-4">
                Nutritional Profile
              </h2>
              {product.nutritionNote && (
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {product.nutritionNote}
                </p>
              )}
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5 bg-muted/50 border border-border rounded-2xl p-6">
                {product.nutrition.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-foreground">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-primary inline-block flex-shrink-0"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {product.benefits && product.benefits.length > 0 && (
            <section className="scroll-reveal">
              <h2 className="font-serif font-semibold text-xl lg:text-2xl text-foreground mb-4">
                Key Benefits
              </h2>
              <ul className="space-y-3">{product.benefits.map((item, i) => bullet(item, i))}</ul>
            </section>
          )}

          {product.usage && product.usage.length > 0 && (
            <section className="scroll-reveal">
              <h2 className="font-serif font-semibold text-xl lg:text-2xl text-foreground mb-4">
                How to Use
              </h2>
              <ul className="space-y-3">{product.usage.map((item, i) => bullet(item, i))}</ul>
            </section>
          )}

          {product.caution && (
            <section className="bg-accent/10 border border-accent/30 rounded-2xl p-6 scroll-reveal">
              <h2 className="font-serif font-semibold text-lg text-foreground mb-2 flex items-center gap-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent"
                  aria-hidden="true"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Caution
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.caution}</p>
            </section>
          )}
        </div>

        {/* Disclaimer */}
        <p className="mt-10 text-xs text-muted-foreground leading-relaxed scroll-reveal">
          Essential oils must be used with care. Always consult a qualified healthcare professional
          before use, especially if pregnant, nursing, on medication, or managing a health
          condition.
        </p>
      </article>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="border-t border-border pt-12">
            <h2 className="text-headline font-serif font-light italic text-foreground mb-8 scroll-reveal">
              More in <span className="text-primary">{product.category}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.slice(0, 3).map((related, i) => (
                <Link
                  key={related.id}
                  href={`/products/${related.id}`}
                  className={`group bg-card border border-border rounded-2xl overflow-hidden shadow-sm card-hover scroll-reveal scroll-reveal-delay-${Math.min(i + 1, 6)}`}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    <AppImage
                      src={related.image}
                      alt={related.alt}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-5 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-serif font-semibold text-lg text-card-foreground leading-snug">
                        {related.name}
                      </h3>
                      <span className="font-semibold text-primary text-sm flex-shrink-0">
                        {related.variants.length > 1
                          ? `From ${formatKES(related.price)}`
                          : formatKES(related.price)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {related.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold mt-1">
                      View Details
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
