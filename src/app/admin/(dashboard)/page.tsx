import React from 'react';
import prisma from '@/lib/prisma';
import BookingStatusSelect from '@/app/admin/components/BookingStatusSelect';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consultation Bookings — Olivoria Organics',
};

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function contactHref(contact: string): string {
  return contact.includes('@') ? `mailto:${contact}` : `tel:${contact}`;
}

export default async function AdminDashboardPage() {
  const bookings = await prisma.consultationBooking.findMany({ orderBy: { createdAt: 'desc' } });

  const stats = [
    { label: 'Total', value: bookings.length },
    { label: 'Pending', value: bookings.filter((b) => b.status === 'pending').length },
    { label: 'Confirmed', value: bookings.filter((b) => b.status === 'confirmed').length },
    { label: 'Completed', value: bookings.filter((b) => b.status === 'completed').length },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Consultation Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">Requests submitted through the consultation form.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5 mb-10">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="font-serif text-3xl font-semibold text-foreground">{stat.value}</p>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border">
          <p className="text-base font-serif italic">No consultation bookings yet.</p>
          <p className="mt-2 text-sm">New requests submitted through the consultation form will appear here.</p>
        </div>
      ) : (
        <>
          {/* Table — tablet and up */}
          <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
                    <th className="px-5 py-3.5 font-medium">Requested</th>
                    <th className="px-5 py-3.5 font-medium">Name</th>
                    <th className="px-5 py-3.5 font-medium">Contact</th>
                    <th className="px-5 py-3.5 font-medium">Consultation</th>
                    <th className="px-5 py-3.5 font-medium">Notes</th>
                    <th className="px-5 py-3.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors align-top">
                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{dateFormat.format(booking.createdAt)}</td>
                      <td className="px-5 py-4 font-medium text-foreground">{booking.name}</td>
                      <td className="px-5 py-4">
                        <a href={contactHref(booking.contact)} className="text-primary underline-offset-2 hover:underline">{booking.contact}</a>
                      </td>
                      <td className="px-5 py-4 text-foreground">
                        {booking.type}
                        <span className="text-muted-foreground"> · {booking.format}</span>
                        {(booking.subcategory || booking.otherSubcategory) && (
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            {booking.otherSubcategory || booking.subcategory}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground max-w-[280px]">
                        {booking.notes ? (
                          <p className="leading-relaxed line-clamp-2" title={booking.notes}>{booking.notes}</p>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <BookingStatusSelect id={booking.id} status={booking.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards — mobile */}
          <div className="md:hidden space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-2xl border border-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{booking.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{dateFormat.format(booking.createdAt)}</p>
                  </div>
                  <BookingStatusSelect id={booking.id} status={booking.status} />
                </div>
                <div className="text-sm space-y-1">
                  <a href={contactHref(booking.contact)} className="block text-primary underline-offset-2 hover:underline">{booking.contact}</a>
                  <p className="text-foreground">
                    {booking.type}
                    <span className="text-muted-foreground"> · {booking.format}</span>
                  </p>
                  {(booking.subcategory || booking.otherSubcategory) && (
                    <p className="text-xs text-muted-foreground">{booking.otherSubcategory || booking.subcategory}</p>
                  )}
                </div>
                {booking.notes && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{booking.notes}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
