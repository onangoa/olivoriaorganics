'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/activity';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

export async function updateBookingStatus(id: string, status: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');
  const userEmail = session.user.email ?? 'unknown user';

  if (!STATUSES.includes(status)) throw new Error('Invalid status');

  const booking = await prisma.consultationBooking.update({ where: { id }, data: { status } });
  await logActivity({
    action: 'booking.status',
    entity: 'Booking',
    entityId: booking.id,
    message: `Updated booking for "${booking.name}" (${booking.type}) to status "${status}".`,
    userEmail,
  });
  revalidatePath('/admin');
}
