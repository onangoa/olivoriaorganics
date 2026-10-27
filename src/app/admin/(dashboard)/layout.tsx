import React from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminSidebar from '@/app/admin/components/AdminSidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar userEmail={session.user.email} />
      <main className="md:pl-72">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
