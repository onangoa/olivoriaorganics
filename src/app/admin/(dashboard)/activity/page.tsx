import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activity Log — Olivoria Organics Admin',
};

const PAGE_SIZE = 50;

const timeFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const ENTITY_FILTERS: { value: string; label: string }[] = [
  { value: 'Product', label: 'Products' },
  { value: 'Category', label: 'Categories' },
  { value: 'Blog Post', label: 'Blog' },
  { value: 'Sale', label: 'Sales' },
  { value: 'Invoice', label: 'Invoices' },
  { value: 'Payment', label: 'Payments' },
  { value: 'Booking', label: 'Bookings' },
  { value: 'Image', label: 'Images' },
];

function actionBadgeClass(action: string) {
  if (action.endsWith('.create')) return 'bg-primary/10 text-primary';
  if (action.endsWith('.delete')) return 'bg-red-100 text-red-700';
  return 'bg-accent/20 text-accent';
}

function actionLabel(action: string) {
  const verb = action.split('.')[1] ?? action;
  return verb.charAt(0).toUpperCase() + verb.slice(1);
}

interface ActivityPageProps {
  searchParams: Promise<{ entity?: string; page?: string }>;
}

export default async function AdminActivityPage({ searchParams }: ActivityPageProps) {
  const params = await searchParams;
  const entity = ENTITY_FILTERS.some((filter) => filter.value === params.entity)
    ? params.entity
    : undefined;
  const requestedPage = Math.floor(Number(params.page) || 1);
  const where = entity ? { entity } : {};

  const total = await prisma.activityLog.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), totalPages);

  const entries = await prisma.activityLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const pageHref = (next: { entity?: string; page: number }) => {
    const search = new URLSearchParams();
    if (next.entity) search.set('entity', next.entity);
    if (next.page > 1) search.set('page', String(next.page));
    const query = search.toString();
    return query ? `/admin/activity?${query}` : '/admin/activity';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Activity Log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total} recorded event{total === 1 ? '' : 's'} — every create, update and delete across
          the site.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Link
          href={pageHref({ page: 1 })}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            entity === undefined
              ? 'bg-foreground text-background'
              : 'border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          All
        </Link>
        {ENTITY_FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={pageHref({ entity: filter.value, page: 1 })}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              entity === filter.value
                ? 'bg-foreground text-background'
                : 'border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border">
          <p className="text-base font-serif italic">No activity yet.</p>
          <p className="mt-2 text-sm">
            Site actions — product, blog, category, sale and booking changes — will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Table — tablet and up */}
          <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
                    <th className="px-5 py-3.5 font-medium">Time</th>
                    <th className="px-5 py-3.5 font-medium">Action</th>
                    <th className="px-5 py-3.5 font-medium">Details</th>
                    <th className="px-5 py-3.5 font-medium">By</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                        {timeFmt.format(entry.createdAt)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${actionBadgeClass(entry.action)}`}
                        >
                          {actionLabel(entry.action)}
                        </span>
                        <span className="block text-[11px] text-muted-foreground mt-1">
                          {entry.entity}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-foreground">{entry.message}</td>
                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap text-xs">
                        {entry.userEmail ?? 'Website visitor'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards — mobile */}
          <div className="md:hidden space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {timeFmt.format(entry.createdAt)}
                  </span>
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${actionBadgeClass(entry.action)}`}
                  >
                    {actionLabel(entry.action)} · {entry.entity}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-2 leading-relaxed">{entry.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  By {entry.userEmail ?? 'Website visitor'}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 mt-8">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages} · {total} event{total === 1 ? '' : 's'}
              </p>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link
                    href={pageHref({ entity, page: page - 1 })}
                    className="px-4 py-2 rounded-full border border-border text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    ← Newer
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={pageHref({ entity, page: page + 1 })}
                    className="px-4 py-2 rounded-full border border-border text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    Older →
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
