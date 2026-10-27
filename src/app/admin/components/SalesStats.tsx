'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import RecordPaymentButton, {
  type PaymentRecord,
} from '@/app/admin/components/RecordPaymentButton';
import { formatKES } from '@/lib/money';

export interface PosSale {
  id: string;
  customerName: string;
  customerContact: string | null;
  createdAt: string;
  paymentStatus: string;
  total: number;
  paidAmount: number;
  itemCount: number;
  invoice: { id: string; number: number; status: string } | null;
  payments: PaymentRecord[];
}

export interface PosBooking {
  id: string;
  status: string;
  createdAt: string;
}

export interface PosInvoice {
  id: string;
  number: number;
  status: string;
  createdAt: string;
  total: number;
}

type Period = 'today' | 'week' | 'month' | 'all';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All Time' },
];

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const rowDateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const groupDayFmt = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const groupMonthFmt = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });

function periodStartMs(period: Period, now: Date): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  if (period === 'today') return d.getTime();
  if (period === 'week') {
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return d.getTime();
  }
  if (period === 'month') {
    d.setDate(1);
    return d.getTime();
  }
  return 0;
}

function paymentBadgeClass(status: string) {
  if (status === 'paid') return 'bg-primary/10 text-primary';
  if (status === 'credit') return 'bg-accent/20 text-accent';
  return 'bg-muted text-muted-foreground';
}

function paymentLabel(status: string) {
  if (status === 'paid') return 'Paid';
  if (status === 'credit') return 'Credit';
  return 'Prospect';
}

interface SalesStatsProps {
  sales: PosSale[];
  bookings: PosBooking[];
  invoices: PosInvoice[];
}

export default function SalesStats({ sales, bookings, invoices }: SalesStatsProps) {
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState<Period>('today');

  useEffect(() => {
    setMounted(true);
  }, []);

  const startMs = useMemo(() => periodStartMs(period, new Date()), [period]);

  const periodSales = useMemo(
    () => sales.filter((sale) => new Date(sale.createdAt).getTime() >= startMs),
    [sales, startMs]
  );
  const periodBookings = useMemo(
    () => bookings.filter((booking) => new Date(booking.createdAt).getTime() >= startMs),
    [bookings, startMs]
  );
  const periodInvoices = useMemo(
    () => invoices.filter((invoice) => new Date(invoice.createdAt).getTime() >= startMs),
    [invoices, startMs]
  );

  const stats = useMemo(() => {
    const prospects = periodSales.filter((sale) => sale.paymentStatus === 'prospect');
    const completed = periodSales.filter((sale) => sale.paymentStatus !== 'prospect');
    const totalRevenue = round2(completed.reduce((sum, sale) => sum + sale.total, 0));
    const paidRevenue = round2(
      periodSales
        .filter((sale) => sale.paymentStatus === 'paid')
        .reduce((sum, sale) => sum + sale.total, 0)
    );
    const creditOutstanding = round2(
      periodSales
        .filter((sale) => sale.paymentStatus === 'credit')
        .reduce((sum, sale) => sum + Math.max(0, sale.total - sale.paidAmount), 0)
    );
    const prospectValue = round2(prospects.reduce((sum, sale) => sum + sale.total, 0));

    const bookingsPending = periodBookings.filter((booking) => booking.status === 'pending').length;
    const bookingsConfirmed = periodBookings.filter(
      (booking) => booking.status === 'confirmed'
    ).length;
    const invoicesCompleted = periodInvoices.filter((invoice) => invoice.status === 'completed');
    const invoicesPending = periodInvoices.filter((invoice) => invoice.status === 'pending');

    return {
      completedCount: completed.length,
      totalRevenue,
      paidRevenue,
      creditOutstanding,
      prospectValue,
      prospectCount: prospects.length,
      bookingsTotal: periodBookings.length,
      bookingsPending,
      bookingsConfirmed,
      invoicesCompletedCount: invoicesCompleted.length,
      invoicesCompletedRevenue: round2(
        invoicesCompleted.reduce((sum, invoice) => sum + invoice.total, 0)
      ),
      invoicesPendingCount: invoicesPending.length,
      invoicesPendingAmount: round2(
        invoicesPending.reduce((sum, invoice) => sum + invoice.total, 0)
      ),
    };
  }, [periodSales, periodBookings, periodInvoices]);

  const groups = useMemo(() => {
    const map = new Map<string, PosSale[]>();
    for (const sale of periodSales) {
      const date = new Date(sale.createdAt);
      const key =
        period === 'all' ? `${date.getFullYear()}-${date.getMonth()}` : date.toDateString();
      const bucket = map.get(key);
      if (bucket) bucket.push(sale);
      else map.set(key, [sale]);
    }
    return Array.from(map.entries()).map(([key, items]) => {
      const date = new Date(items[0].createdAt);
      return {
        key,
        label: period === 'all' ? groupMonthFmt.format(date) : groupDayFmt.format(date),
        items,
        total: round2(items.reduce((sum, sale) => sum + sale.total, 0)),
      };
    });
  }, [periodSales, period]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {PERIODS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setPeriod(option.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              period === option.id
                ? 'bg-foreground text-background'
                : 'border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {mounted ? (
        <div className="space-y-6 mb-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            <div>
              <p className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                {formatKES(stats.totalRevenue)}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mt-1">
                Total Sales
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedCount} completed · {stats.prospectCount} prospect
                {stats.prospectCount === 1 ? '' : 's'}
              </p>
            </div>
            <div>
              <p className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                {formatKES(stats.paidRevenue)}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mt-1">
                Paid Revenue
              </p>
            </div>
            <div>
              <p className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                {formatKES(stats.creditOutstanding)}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mt-1">
                On Credit (outstanding)
              </p>
            </div>
            <div>
              <p className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                {formatKES(stats.prospectValue)}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mt-1">
                Prospect Value
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-muted/20 p-5 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            <div>
              <p className="font-serif text-xl font-semibold text-foreground">
                {stats.bookingsTotal}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mt-1">
                Bookings
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stats.bookingsPending} pending · {stats.bookingsConfirmed} confirmed
              </p>
            </div>
            <div>
              <p className="font-serif text-xl font-semibold text-foreground">
                {stats.invoicesCompletedCount}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mt-1">
                Invoices Completed
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatKES(stats.invoicesCompletedRevenue)}
              </p>
            </div>
            <div>
              <p className="font-serif text-xl font-semibold text-foreground">
                {stats.invoicesPendingCount}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mt-1">
                Invoices Pending
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatKES(stats.invoicesPendingAmount)}
              </p>
            </div>
            <div>
              <p className="font-serif text-xl font-semibold text-foreground">
                {periodSales.length}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mt-1">
                Sales Recorded
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Completed sales and prospects</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      )}

      <h2 className="font-serif font-semibold text-lg text-foreground mb-1">Recorded Sales</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Grouped {period === 'all' ? 'by month' : 'by day'} for{' '}
        {PERIODS.find((option) => option.id === period)?.label.toLowerCase()}.
      </p>

      {mounted ? (
        groups.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border">
            <p className="text-base font-serif italic">No sales in this period.</p>
            <p className="mt-2 text-sm">Use the till to record one.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map((group) => (
              <section key={group.key} className="space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-serif font-semibold text-base text-foreground">
                    {group.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {group.items.length} sale{group.items.length === 1 ? '' : 's'} ·{' '}
                    {formatKES(group.total)}
                  </p>
                </div>

                <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
                          <th className="px-5 py-3.5 font-medium">Date</th>
                          <th className="px-5 py-3.5 font-medium">Customer</th>
                          <th className="px-5 py-3.5 font-medium">Items</th>
                          <th className="px-5 py-3.5 font-medium">Payment</th>
                          <th className="px-5 py-3.5 font-medium">Invoice</th>
                          <th className="px-5 py-3.5 font-medium">Total</th>
                          <th className="px-5 py-3.5 font-medium text-right">PDF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((sale) => (
                          <tr
                            key={sale.id}
                            className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                              {rowDateFmt.format(new Date(sale.createdAt))}
                            </td>
                            <td className="px-5 py-4">
                              <span className="font-medium text-foreground">
                                {sale.customerName}
                              </span>
                              {sale.customerContact && (
                                <span className="block text-xs text-muted-foreground mt-0.5">
                                  {sale.customerContact}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                              {sale.itemCount} item{sale.itemCount === 1 ? '' : 's'}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${paymentBadgeClass(
                                  sale.paymentStatus
                                )}`}
                              >
                                {paymentLabel(sale.paymentStatus)}
                              </span>
                              {sale.paymentStatus === 'credit' && (
                                <>
                                  <span className="block text-xs text-muted-foreground mt-1">
                                    Paid {formatKES(sale.paidAmount)} · Due{' '}
                                    {formatKES(Math.max(0, round2(sale.total - sale.paidAmount)))}
                                  </span>
                                  <span className="block mt-1">
                                    <RecordPaymentButton
                                      saleId={sale.id}
                                      customerName={sale.customerName}
                                      total={sale.total}
                                      amountPaid={sale.paidAmount}
                                      payments={sale.payments}
                                    />
                                  </span>
                                </>
                              )}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              {sale.invoice ? (
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    sale.invoice.status === 'completed'
                                      ? 'bg-foreground text-background'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  #{String(sale.invoice.number).padStart(4, '0')} ·{' '}
                                  {sale.invoice.status === 'completed' ? 'Completed' : 'Pending'}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </td>
                            <td className="px-5 py-4 font-semibold text-primary whitespace-nowrap">
                              {formatKES(sale.total)}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-4">
                                {sale.paymentStatus === 'prospect' &&
                                  sale.invoice?.status === 'pending' && (
                                    <Link
                                      href={`/admin/sales/${sale.id}/edit`}
                                      className="text-xs font-semibold text-primary underline underline-offset-2"
                                    >
                                      Edit
                                    </Link>
                                  )}
                                {sale.invoice ? (
                                  <a
                                    href={`/api/admin/invoices/${sale.invoice.id}/pdf`}
                                    className="text-xs font-semibold text-primary underline underline-offset-2"
                                  >
                                    Download
                                  </a>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="md:hidden space-y-3">
                  {group.items.map((sale) => (
                    <div key={sale.id} className="rounded-2xl border border-border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {rowDateFmt.format(new Date(sale.createdAt))}
                          </p>
                          <p className="font-medium text-foreground mt-0.5">{sale.customerName}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary whitespace-nowrap">
                          {formatKES(sale.total)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border">
                        <span className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${paymentBadgeClass(
                              sale.paymentStatus
                            )}`}
                          >
                            {paymentLabel(sale.paymentStatus)}
                          </span>
                          {sale.invoice && (
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                sale.invoice.status === 'completed'
                                  ? 'bg-foreground text-background'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              #{String(sale.invoice.number).padStart(4, '0')} ·{' '}
                              {sale.invoice.status === 'completed' ? 'Completed' : 'Pending'}
                            </span>
                          )}
                        </span>
                        {sale.invoice && (
                          <span className="flex items-center gap-4">
                            {sale.paymentStatus === 'prospect' &&
                              sale.invoice.status === 'pending' && (
                                <Link
                                  href={`/admin/sales/${sale.id}/edit`}
                                  className="text-xs font-semibold text-primary underline underline-offset-2"
                                >
                                  Edit
                                </Link>
                              )}
                            <a
                              href={`/api/admin/invoices/${sale.invoice.id}/pdf`}
                              className="text-xs font-semibold text-primary underline underline-offset-2"
                            >
                              PDF
                            </a>
                          </span>
                        )}
                      </div>
                      {sale.paymentStatus === 'credit' && (
                        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border">
                          <span className="text-xs text-muted-foreground">
                            Paid {formatKES(sale.paidAmount)} · Due{' '}
                            {formatKES(Math.max(0, round2(sale.total - sale.paidAmount)))}
                          </span>
                          <RecordPaymentButton
                            saleId={sale.id}
                            customerName={sale.customerName}
                            total={sale.total}
                            amountPaid={sale.paidAmount}
                            payments={sale.payments}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )
      ) : (
        <div className="h-40 rounded-2xl bg-muted/40 animate-pulse" aria-hidden="true" />
      )}
    </div>
  );
}
