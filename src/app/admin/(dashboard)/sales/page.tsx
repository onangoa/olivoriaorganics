import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import SalesStats, {
  type PosBooking,
  type PosInvoice,
  type PosSale,
} from '@/app/admin/components/SalesStats';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sales — Olivoria Organics Admin',
};

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export default async function AdminSalesPage() {
  const [sales, bookings, invoices] = await Promise.all([
    prisma.sale.findMany({
      include: { items: true, invoice: true, payments: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.consultationBooking.findMany({
      select: { id: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invoice.findMany({
      select: {
        id: true,
        number: true,
        status: true,
        createdAt: true,
        sale: { select: { total: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const posSales: PosSale[] = sales.map((sale) => {
    const paid = round2(sale.payments.reduce((sum, payment) => sum + payment.amount.toNumber(), 0));
    return {
      id: sale.id,
      customerName: sale.customerName,
      customerContact: sale.customerContact,
      createdAt: sale.createdAt.toISOString(),
      paymentStatus: sale.paymentStatus,
      total: sale.total.toNumber(),
      paidAmount: paid,
      itemCount: sale.items.length,
      invoice: sale.invoice
        ? {
            id: sale.invoice.id,
            number: sale.invoice.number,
            status: sale.invoice.status,
          }
        : null,
      payments: sale.payments
        .slice()
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((payment) => ({
          id: payment.id,
          amount: payment.amount.toNumber(),
          note: payment.note,
          createdAt: payment.createdAt.toISOString(),
        })),
    };
  });

  const posBookings: PosBooking[] = bookings.map((booking) => ({
    id: booking.id,
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
  }));

  const posInvoices: PosInvoice[] = invoices.map((invoice) => ({
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    createdAt: invoice.createdAt.toISOString(),
    total: invoice.sale.total.toNumber(),
  }));

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Sales</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stats and recorded sales for the selected day, week or month. Record quick sales at the
            till.
          </p>
        </div>
        <Link
          href="/admin/pos"
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold transition-opacity hover:opacity-90 whitespace-nowrap"
        >
          + New Sale
        </Link>
      </div>
      <SalesStats sales={posSales} bookings={posBookings} invoices={posInvoices} />
    </div>
  );
}
