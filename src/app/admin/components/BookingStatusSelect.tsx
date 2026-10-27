'use client';

import React, { useState, useTransition } from 'react';
import { updateBookingStatus } from '@/app/admin/actions';

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-amber-700 border-amber-300 bg-amber-50',
  confirmed: 'text-blue-700 border-blue-300 bg-blue-50',
  completed: 'text-green-700 border-green-300 bg-green-50',
  cancelled: 'text-red-700 border-red-300 bg-red-50',
};

export default function BookingStatusSelect({ id, status }: { id: string; status: string }) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        setValue(next);
        startTransition(async () => {
          await updateBookingStatus(id, next);
        });
      }}
      className={`px-2.5 py-1.5 rounded-full text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 ${STATUS_STYLES[value] ?? 'text-muted-foreground border-border bg-card'}`}
      aria-label="Booking status"
    >
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}
