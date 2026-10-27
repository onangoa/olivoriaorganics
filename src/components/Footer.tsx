import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { getProductCategories } from '@/lib/content';

export default async function Footer() {
  const year = 2026;
  const productCategories = await getProductCategories();

  return (
    <footer className="border-t border-border bg-background pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <AppLogo width={45} height={32} />
              <span className="font-serif font-semibold text-base text-primary">Olivoria Organics</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Wholistic organic wellness rooted in natural living and Christian health principles. Nourishing body, mind, and spirit.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/consultations?book=1"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Consultation
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">Navigate</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', href: '/' },
                { label: 'Products', href: '/products' },
                { label: 'Consultations', href: '/consultations' },
                { label: 'Health Reform', href: '/health-reform' },
                { label: 'Our Blog', href: '/blog' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ]?.map((link) => (
                <li key={link?.href}>
                  <Link href={link?.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">Products</h3>
            <ul className="space-y-2.5">
              {productCategories?.map((cat) => (
                <li key={cat}>
                  <Link href="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">Contact</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-accent">📍</span>
                <span>Matasia, along Kiserian–Matasia Road,<br />Moran Towers, Matasia</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-accent">📞</span>
                <a href="tel:+254708261674" className="hover:text-primary transition-colors">+254 708 261674</a>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-accent">✉️</span>
                <a href="mailto:hello@olivoriaorganics.com" className="hover:text-primary transition-colors">hello@olivoriaorganics.com</a>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-accent">🕐</span>
                <span>Mon–Thu: 9:00 AM – 7:30 PM<br />Fri: 9:00 AM – 3:00 PM<br />Sat: Closed<br />Sun: 9:00 AM – 6:30 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {year} Olivoria Organics. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/contact" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Terms & Conditions</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Health Disclaimer</Link>
          </div>
          {/* <p className="text-center sm:text-right">For educational purposes only. Not medical advice.</p> */}
        </div>
      </div>
    </footer>
  );
}