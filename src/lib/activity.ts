import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export const ACTIVITY_ENTITIES = [
  'Product',
  'Category',
  'Blog Post',
  'Sale',
  'Invoice',
  'Payment',
  'Booking',
  'Image',
] as const;

export type ActivityEntity = (typeof ACTIVITY_ENTITIES)[number];

export interface ActivityInput {
  action: string;
  entity: ActivityEntity;
  entityId?: string | null;
  message: string;
  userEmail?: string | null;
}

/**
 * Records an entry in the admin activity log. Never throws — a logging
 * failure must not break the business operation it is describing.
 */
export async function logActivity(input: ActivityInput): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        message: input.message,
        userEmail: input.userEmail ?? null,
      },
    });
    revalidatePath('/admin/activity');
  } catch (error) {
    console.error('Failed to write activity log entry:', error);
  }
}
