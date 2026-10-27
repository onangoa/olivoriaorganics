'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
  action: () => Promise<{ ok: boolean; error?: string }>;
  confirmMessage: string;
  label?: string;
}

export default function DeleteButton({ action, confirmMessage, label = 'Delete' }: DeleteButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!window.confirm(confirmMessage)) return;
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error || 'Delete failed.');
      }
    });
  };

  return (
    <span className="inline-flex flex-col items-start">
      <button
        onClick={handleDelete}
        disabled={pending}
        className="text-xs font-semibold text-red-600 underline underline-offset-2 hover:text-red-700 disabled:opacity-50"
      >
        {pending ? 'Deleting…' : label}
      </button>
      {error && <span className="text-[10px] text-red-600 mt-0.5 max-w-[160px]">{error}</span>}
    </span>
  );
}
