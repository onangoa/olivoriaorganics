'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import type { Product } from '@/lib/content';

const WHATSAPP_NUMBER = '254708261674';

interface ProductsContentProps {
  products: Product[];
}

export default function ProductsContent({ products }: ProductsContentProps) {
  const categories = ['All', ...Array.from(new Set(products.map((product) => product.category)))];
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);
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
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const visible = filtered.slice(0, visibleCount);

  const handleWhatsApp = (productName: string) => {
    const message = encodeURIComponent(`Hello, I would like to enquire about ${productName}. Could you please provide more information about availability and price?`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <div ref={ref} className="pt-24 pb-20">
      {/* Page Header */}
      <div className="bg-muted/30 border-b border-border py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="section-label scroll-reveal">Our Products</span>
            <h1 className="text-display font-serif font-light italic text-foreground mt-4 scroll-reveal scroll-reveal-delay-1">
              Organic & Natural<br />
              <span className="text-primary">Product Catalogue</span>
            </h1>
            <p className="text-muted-foreground mt-4 leading-relaxed scroll-reveal scroll-reveal-delay-2">
              Browse our carefully curated seeds and nuts, cold-pressed and essential oils, dried fruits, kitchen spices, botanical herbs, plant and herbal extracts, and tailored herbal teas. Enquire about any product via WhatsApp.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Search & Filters */}
        <div className="flex flex-col gap-6 mb-10 scroll-reveal">
          {/* Search */}
          <div className="relative max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {setSearchQuery(e.target.value);setVisibleCount(8);}}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              aria-label="Search products" />
            
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) =>
            <button
              key={cat}
              onClick={() => {setActiveCategory(cat);setVisibleCount(8);}}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === cat ?
              'bg-primary text-primary-foreground shadow-md' :
              'bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-primary'}`
              }>
              
                {cat}
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-6">
          Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} products
          {activeCategory !== 'All' && ` in ${activeCategory}`}
        </p>

        {/* Products Grid */}
        {filtered.length === 0 ?
        <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-serif italic">No products found matching your search.</p>
            <button onClick={() => {setSearchQuery('');setActiveCategory('All');}} className="mt-4 text-primary underline text-sm">Clear filters</button>
          </div> :

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visible.map((product) =>
          <article key={product.id} className="product-card">
                <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  <AppImage
                src={product.image}
                alt={product.alt}
                fill
                className="object-contain transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
              
                  {product.featured &&
              <div className="absolute top-3 left-3">
                      <span className="inline-block px-2 py-0.5 bg-accent text-accent-foreground text-xs font-semibold rounded-full">Featured</span>
                    </div>
              }
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-background/90 backdrop-blur-sm text-xs font-medium text-green-700 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                      {product.availability}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-2.5">
                  <span className="text-xs text-accent font-medium uppercase tracking-wide">{product.category}</span>
                  <h2 className="font-serif font-semibold text-base text-card-foreground leading-snug">
                    <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors">
                      {product.name}
                    </Link>
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-semibold text-primary">{product.price}</span>
                    <Link
                      href={`/products/${product.id}`}
                      className="text-xs font-semibold text-primary underline underline-offset-2 hover:text-primary/70 transition-colors">
                      View Details
                    </Link>
                  </div>
                  <button
                onClick={() => handleWhatsApp(product.name)}
                className="whatsapp-btn flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg text-xs font-semibold mt-1">
                
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Enquire on WhatsApp
                  </button>
                </div>
              </article>
          )}
          </div>
        }

        {/* Load More */}
        {visibleCount < filtered.length &&
        <div className="text-center mt-12">
            <button
            onClick={() => setVisibleCount((v) => v + 8)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/5 transition-colors">
            
              Load More Products
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        }

        {/* Health Disclaimer */}
        <div className="mt-16 p-5 bg-muted/50 rounded-xl border border-border">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            <strong className="text-foreground">Health Disclaimer:</strong> Products are not intended to diagnose, treat, cure, or prevent any disease. Descriptions are for educational purposes only. Always consult a qualified healthcare professional before use, especially if pregnant, nursing, or on medication.
          </p>
        </div>
      </div>
    </div>);

}
