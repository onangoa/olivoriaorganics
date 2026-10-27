import React from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import LoginForm from '@/app/admin/login/components/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login — Olivoria Organics',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) redirect('/admin');

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <LoginForm />
    </main>
  );
}
