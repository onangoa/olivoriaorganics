'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { recordPayment } from '@/app/admin/sale-actions';
import { formatKES } from '@/lib/money';

export interface PaymentRecord {
  id: string;
  amount: number;
  note: string | null;
  createdAt: string;
}

interface RecordPaymentButtonProps {
  saleId: string;
  customerName: string;
  total: number;
  amountPaid: number;
  payments: PaymentRecord[];
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all';

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export default function RecordPaymentButton({
  saleId,
  customerName,
  total,
  amountPaid,
  payments,
}: RecordPaymentButtonProps) {
  const router = useRouter();
  const remaining = round2(Math.max(0, total - amountPaid));
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(remaining));
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleOpen = () => {
    setAmount(String(remaining));
    setNote('');
    setError(null);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const value = round2(Number(amount));
    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter a payment amount greater than zero.');
      return;
    }
    setSaving(true);
    try {
      const result = await recordPayment(saleId, value, note || undefined);
      if (!result.ok) {
        setError(result.error);
        setSaving(false);
        return;
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="text-xs font-semibold text-primary underline underline-offset-2 hover:text-primary/70"
      >
        Record Payment
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="font-serif font-semibold text-lg text-foreground">Record Payment</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{customerName}</p>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1.5 text-sm">
              <p className="flex justify-between gap-6 text-muted-foreground">
                <span>Total</span>
                <span className="font-medium text-foreground">{formatKES(total)}</span>
              </p>
              <p className="flex justify-between gap-6 text-muted-foreground">
                <span>Paid so far</span>
                <span className="font-medium text-foreground">{formatKES(amountPaid)}</span>
              </p>
              <p className="flex justify-between gap-6 text-muted-foreground">
                <span>Remaining</span>
                <span className="font-semibold text-primary">{formatKES(remaining)}</span>
              </p>
            </div>

            {payments.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  Payment history
                </p>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between gap-4 text-sm border-b border-border last:border-0 pb-1.5 last:pb-0"
                    >
                      <span className="text-muted-foreground">
                        {dateFormat.format(new Date(payment.createdAt))}
                        {payment.note ? ` · ${payment.note}` : ''}
                      </span>
                      <span className="font-semibold text-foreground whitespace-nowrap">
                        {formatKES(payment.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="pay-amount"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Amount (KSh) *
                </label>
                <input
                  id="pay-amount"
                  type="number"
                  min={0.01}
                  step="0.01"
                  max={remaining}
                  className={inputClass}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="pay-note"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Note
                </label>
                <input
                  id="pay-note"
                  className={inputClass}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional — e.g. M-Pesa, cash, cheque"
                />
              </div>

              {error && (
                <div
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-full border border-border text-sm font-semibold text-foreground transition-all hover:bg-muted/50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                >
                  {saving ? 'Recording…' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
