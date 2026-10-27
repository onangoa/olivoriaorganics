import React from 'react';
import prisma from '@/lib/prisma';
import { deleteSale } from '@/app/admin/sale-actions';
import DeleteButton from '@/app/admin/components/DeleteButton';
import CompleteInvoiceButton from '@/app/admin/components/CompleteInvoiceButton';
import { formatKES } from '@/lib/money';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invoices — Olivoria Organics Admin',
};

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const invoiceLabel = (n: number) => `#${String(n).padStart(4, '0')}`;

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

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
        status === 'completed' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
      }`}
    >
      {status === 'completed' ? 'Completed' : 'Pending'}
    </span>
  );
}

export default async function AdminInvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: { sale: { include: { items: true } } },
    orderBy: { number: 'desc' },
  });

  const completed = invoices.filter((invoice) => invoice.status === 'completed');
  const pending = invoices.filter((invoice) => invoice.status === 'pending');
  const completedRevenue = completed.reduce(
    (sum, invoice) => sum + invoice.sale.total.toNumber(),
    0
  );
  const pendingAmount = pending.reduce((sum, invoice) => sum + invoice.sale.total.toNumber(), 0);

  const stats = [
    { label: 'Completed Revenue', value: formatKES(completedRevenue) },
    { label: 'Pending Invoices', value: String(pending.length) },
    { label: 'Pending Amount', value: formatKES(pendingAmount) },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Invoices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paid and credit sales arrive here already <strong>completed</strong> with stock reduced.
          Prospects arrive as pending — marking one completed converts it to a credit sale and
          reduces stock.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 mb-10">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
              {stat.value}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border">
          <p className="text-base font-serif italic">No invoices yet.</p>
          <p className="mt-2 text-sm">
            Record a sale on the Sales page — an invoice is created automatically.
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
                    <th className="px-5 py-3.5 font-medium">Invoice</th>
                    <th className="px-5 py-3.5 font-medium">Date</th>
                    <th className="px-5 py-3.5 font-medium">Customer</th>
                    <th className="px-5 py-3.5 font-medium">Payment</th>
                    <th className="px-5 py-3.5 font-medium">Status</th>
                    <th className="px-5 py-3.5 font-medium">Total</th>
                    <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-4 font-semibold text-foreground whitespace-nowrap">
                        {invoiceLabel(invoice.number)}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                        {dateFormat.format(invoice.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-medium text-foreground">
                          {invoice.sale.customerName}
                        </span>
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          {invoice.sale.items.length} item
                          {invoice.sale.items.length === 1 ? '' : 's'}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${paymentBadgeClass(
                            invoice.sale.paymentStatus
                          )}`}
                        >
                          {paymentLabel(invoice.sale.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill status={invoice.status} />
                      </td>
                      <td className="px-5 py-4 font-semibold text-primary whitespace-nowrap">
                        {formatKES(invoice.sale.total.toNumber())}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-4">
                          {invoice.status !== 'completed' && (
                            <CompleteInvoiceButton
                              invoiceId={invoice.id}
                              invoiceNumber={invoice.number}
                            />
                          )}
                          <a
                            href={`/api/admin/invoices/${invoice.id}/pdf`}
                            className="text-xs font-semibold text-primary underline underline-offset-2"
                          >
                            Download PDF
                          </a>
                          <DeleteButton
                            action={deleteSale.bind(null, invoice.saleId)}
                            confirmMessage={`Delete invoice ${invoiceLabel(invoice.number)}?${
                              invoice.status === 'completed' ? ' Stock will be restored.' : ''
                            } This cannot be undone.`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards — mobile */}
          <div className="md:hidden space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{invoiceLabel(invoice.number)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {dateFormat.format(invoice.createdAt)} · {invoice.sale.customerName}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary whitespace-nowrap">
                    {formatKES(invoice.sale.total.toNumber())}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <StatusPill status={invoice.status} />
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${paymentBadgeClass(
                      invoice.sale.paymentStatus
                    )}`}
                  >
                    {paymentLabel(invoice.sale.paymentStatus)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border">
                  <span className="flex items-center gap-4">
                    {invoice.status !== 'completed' && (
                      <CompleteInvoiceButton
                        invoiceId={invoice.id}
                        invoiceNumber={invoice.number}
                      />
                    )}
                  </span>
                  <span className="flex items-center gap-4">
                    <a
                      href={`/api/admin/invoices/${invoice.id}/pdf`}
                      className="text-xs font-semibold text-primary underline underline-offset-2"
                    >
                      PDF
                    </a>
                    <DeleteButton
                      action={deleteSale.bind(null, invoice.saleId)}
                      confirmMessage={`Delete invoice ${invoiceLabel(invoice.number)}?${
                        invoice.status === 'completed' ? ' Stock will be restored.' : ''
                      } This cannot be undone.`}
                    />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
