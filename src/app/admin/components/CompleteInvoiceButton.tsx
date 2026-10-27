'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { completeInvoice } from '@/app/admin/sale-actions';

interface CompleteInvoiceButtonProps {
  invoiceId: string;
  invoiceNumber: number;
}

export default function CompleteInvoiceButton({
  invoiceId,
  invoiceNumber,
}: CompleteInvoiceButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleComplete = () => {
    if (
      !window.confirm(
        `Mark invoice #${String(invoiceNumber).padStart(4, '0')} as completed? Stock will be reduced for its items.`
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await completeInvoice(invoiceId);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <span className="inline-flex flex-col items-start">
      <button
        onClick={handleComplete}
        disabled={pending}
        className="text-xs font-semibold text-primary underline underline-offset-2 hover:text-primary/70 disabled:opacity-50"
      >
        {pending ? 'Completing…' : 'Mark Completed'}
      </button>
      {error && <span className="text-[10px] text-red-600 mt-0.5 max-w-[220px]">{error}</span>}
    </span>
  );
}
