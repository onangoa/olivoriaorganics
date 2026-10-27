'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import SignOutButton from '@/app/admin/components/SignOutButton';

const NAV_ITEMS = [
  { label: 'Bookings', href: '/admin', iconName: 'CalendarDaysIcon' },
  { label: 'Products', href: '/admin/products', iconName: 'ShoppingBagIcon' },
  { label: 'Categories', href: '/admin/categories', iconName: 'TagIcon' },
  { label: 'Point of Sale', href: '/admin/pos', iconName: 'ShoppingCartIcon' },
  { label: 'Sales', href: '/admin/sales', iconName: 'BanknotesIcon' },
  { label: 'Invoices', href: '/admin/invoices', iconName: 'DocumentTextIcon' },
  { label: 'Stock Movements', href: '/admin/stock', iconName: 'ArrowsUpDownIcon' },
  { label: 'Blog Posts', href: '/admin/blog', iconName: 'NewspaperIcon' },
];

interface AdminSidebarProps {
  userEmail?: string | null;
}

export default function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const brand = (
    <Image
      src="/assets/images/app_logo.png"
      alt="Olivoria Organics — Admin"
      width={32}
      height={53}
      className="h-12 w-auto"
      priority
    />
  );

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              active
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Icon name={item.iconName} size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-border px-4 py-4 flex flex-col gap-3">
      {userEmail ? (
        <span className="text-xs text-muted-foreground truncate" title={userEmail}>
          {userEmail}
        </span>
      ) : null}
      <SignOutButton />
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3 h-16 px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-md text-foreground hover:bg-muted transition-colors"
            aria-label="Open admin menu"
            aria-expanded={mobileOpen}
          >
            <Icon name="Bars3Icon" size={22} />
          </button>
          {brand}
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-72 flex-col border-r border-border bg-background">
        <div className="flex items-center h-16 px-6 border-b border-border">{brand}</div>
        <div className="flex-1 overflow-y-auto p-4">{nav}</div>
        {footer}
      </aside>

      {/* Mobile drawer backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col border-r border-border bg-background transition-[transform,visibility] duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {brand}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 -mr-2 rounded-md text-foreground hover:bg-muted transition-colors"
            aria-label="Close admin menu"
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{nav}</div>
        {footer}
      </aside>
    </>
  );
}
