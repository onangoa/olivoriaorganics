'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Consultations', href: '/consultations' },
  // { label: 'Health Reform', href: '/health-reform' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : Boolean(pathname?.startsWith(href));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background border-b border-border shadow-md'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0" aria-label="Olivoria Organics — Home">
              <AppLogo width={68} height={48} />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks?.map((link) => {
                const active = isActive(link?.href ?? '/');
                return (
                  <Link
                    key={link?.href}
                    href={link?.href ?? '/'}
                    className={`nav-link px-3 py-2 rounded-md hover:bg-muted ${active ? 'nav-link-active' : ''}`}
                  >
                    {link?.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/consultations?book=1"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Consultation
              </Link>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-md text-foreground hover:bg-muted transition-colors"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileOpen ? (
                  <Icon name="XMarkIcon" size={22} />
                ) : (
                  <Icon name="Bars3Icon" size={22} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex flex-col h-full pt-20 pb-8 px-6">
            <nav className="flex flex-col gap-1 flex-1">
              {navLinks?.map((link) => {
                const active = isActive(link?.href ?? '/');
                return (
                  <Link
                    key={link?.href}
                    href={link?.href ?? '/'}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center py-4 text-lg font-medium border-b border-border transition-colors ${
                      active ? 'text-primary' : 'text-foreground hover:text-primary'
                    }`}
                  >
                    {link?.label}
                  </Link>
                );
              })}
            </nav>
            <Link
              href="/consultations?book=1"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-primary-foreground text-base font-semibold mt-6 shadow-md"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book Consultation
            </Link>
          </div>
        </div>
      )}
    </>
  );
}