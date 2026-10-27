'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/activity';
import { parseVariantLabels } from '@/lib/content';

async function requireSession(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');
  return session.user.email ?? 'unknown user';
}

function revalidateCategoryPages() {
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/admin/products');
  revalidatePath('/admin/categories');
}

export async function createCategory(
  name: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userEmail = await requireSession();

    const trimmed = name?.trim();
    if (!trimmed) return { ok: false, error: 'Category name is required.' };
    if (trimmed.length > 191)
      return { ok: false, error: 'Category names must be 191 characters or fewer.' };

    const exists = await prisma.category.findUnique({ where: { name: trimmed } });
    if (exists) return { ok: false, error: `Category "${trimmed}" already exists.` };

    await prisma.category.create({ data: { name: trimmed } });
    await logActivity({
      action: 'category.create',
      entity: 'Category',
      entityId: trimmed,
      message: `Created category "${trimmed}".`,
      userEmail,
    });
    revalidateCategoryPages();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to create category.',
    };
  }
}

export async function setCategoryVariantLabels(
  name: string,
  labels: string[]
): Promise<{ ok: true; labels: string[] } | { ok: false; error: string }> {
  try {
    const userEmail = await requireSession();

    const trimmed = name?.trim();
    if (!trimmed) return { ok: false, error: 'Category name is required.' };
    const category = await prisma.category.findUnique({ where: { name: trimmed } });
    if (!category) return { ok: false, error: `Category "${trimmed}" not found.` };

    const seen = new Set<string>();
    const cleaned: string[] = [];
    for (const label of Array.isArray(labels) ? labels : []) {
      const value = typeof label === 'string' ? label.trim() : '';
      if (!value || seen.has(value)) continue;
      if (value.length > 191) {
        return { ok: false, error: 'Variant labels must be 191 characters or fewer.' };
      }
      seen.add(value);
      cleaned.push(value);
    }
    if (cleaned.length > 40) {
      return { ok: false, error: 'A category can have at most 40 variant labels.' };
    }

    const current = parseVariantLabels(category.variantLabels);
    const removed = current.filter((label) => !cleaned.includes(label));
    if (removed.length > 0) {
      const users = await prisma.product.findMany({
        where: { category: trimmed, variants: { some: { label: { in: removed } } } },
        select: {
          name: true,
          variants: { where: { label: { in: removed } }, select: { label: true } },
        },
      });
      const byLabel = new Map<string, string[]>();
      for (const product of users) {
        for (const variant of product.variants) {
          const bucket = byLabel.get(variant.label) ?? [];
          if (!bucket.includes(product.name)) bucket.push(product.name);
          byLabel.set(variant.label, bucket);
        }
      }
      if (byLabel.size > 0) {
        const detail = [...byLabel.entries()]
          .map(([label, names]) => `"${label}" — ${names.join(', ')}`)
          .join(' · ');
        return {
          ok: false,
          error: `Labels in use can't be removed — untick them on those products first. In use: ${detail}.`,
        };
      }
    }

    await prisma.category.update({
      where: { name: trimmed },
      data: {
        variantLabels:
          cleaned.length > 0 ? (cleaned as unknown as Prisma.InputJsonValue) : Prisma.DbNull,
      },
    });

    await logActivity({
      action: 'category.labels',
      entity: 'Category',
      entityId: trimmed,
      message: `Saved variant labels for category "${trimmed}" — ${cleaned.length} label${cleaned.length === 1 ? '' : 's'}.`,
      userEmail,
    });
    revalidateCategoryPages();
    return { ok: true, labels: cleaned };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to save variant labels.',
    };
  }
}

export async function addCategoryVariantLabel(
  name: string,
  label: string
): Promise<{ ok: true; labels: string[] } | { ok: false; error: string }> {
  try {
    const userEmail = await requireSession();

    const trimmedName = name?.trim();
    const trimmedLabel = label?.trim();
    if (!trimmedName) return { ok: false, error: 'Category name is required.' };
    if (!trimmedLabel) return { ok: false, error: 'Variant label is required.' };
    if (trimmedLabel.length > 191) {
      return { ok: false, error: 'Variant labels must be 191 characters or fewer.' };
    }

    const category = await prisma.category.findUnique({ where: { name: trimmedName } });
    const current = category ? parseVariantLabels(category.variantLabels) : [];
    if (current.includes(trimmedLabel)) {
      return { ok: true, labels: current };
    }
    if (current.length >= 40) {
      return { ok: false, error: 'A category can have at most 40 variant labels.' };
    }

    const labels = [...current, trimmedLabel];
    await prisma.category.upsert({
      where: { name: trimmedName },
      create: { name: trimmedName, variantLabels: labels as unknown as Prisma.InputJsonValue },
      update: { variantLabels: labels as unknown as Prisma.InputJsonValue },
    });

    await logActivity({
      action: 'category.labels',
      entity: 'Category',
      entityId: trimmedName,
      message: `Added variant label "${trimmedLabel}" to category "${trimmedName}".`,
      userEmail,
    });
    revalidateCategoryPages();
    return { ok: true, labels };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to add variant label.',
    };
  }
}

export async function renameCategory(
  oldName: string,
  newName: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userEmail = await requireSession();

    const from = oldName?.trim();
    const to = newName?.trim();
    if (!from) return { ok: false, error: 'Current category name is required.' };
    if (!to) return { ok: false, error: 'New category name is required.' };
    if (to.length > 191)
      return { ok: false, error: 'Category names must be 191 characters or fewer.' };
    if (from === to) return { ok: false, error: 'The new name is the same as the current name.' };

    const target = await prisma.category.findUnique({ where: { name: to } });
    if (target && from !== to) {
      return { ok: false, error: `Category "${to}" already exists.` };
    }

    await prisma.$transaction(async (tx) => {
      const source = await tx.category.findUnique({ where: { name: from } });
      await tx.category.upsert({
        where: { name: to },
        create: { name: to, variantLabels: source?.variantLabels ?? Prisma.DbNull },
        update: {},
      });
      await tx.product.updateMany({ where: { category: from }, data: { category: to } });
      await tx.category.deleteMany({ where: { name: from } });
    });

    await logActivity({
      action: 'category.rename',
      entity: 'Category',
      entityId: to,
      message: `Renamed category "${from}" to "${to}".`,
      userEmail,
    });
    revalidateCategoryPages();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to rename category.',
    };
  }
}

export async function deleteCategory(
  name: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userEmail = await requireSession();

    const trimmed = name?.trim();
    if (!trimmed) return { ok: false, error: 'Category name is required.' };

    const productCount = await prisma.product.count({ where: { category: trimmed } });
    if (productCount > 0) {
      return {
        ok: false,
        error: `Cannot delete "${trimmed}" — ${productCount} product${productCount === 1 ? '' : 's'} still use it. Reassign or delete them first.`,
      };
    }

    await prisma.category.deleteMany({ where: { name: trimmed } });
    await logActivity({
      action: 'category.delete',
      entity: 'Category',
      entityId: trimmed,
      message: `Deleted category "${trimmed}".`,
      userEmail,
    });
    revalidateCategoryPages();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to delete category.',
    };
  }
}
