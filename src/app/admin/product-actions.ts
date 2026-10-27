'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/slugify';
import { logActivity } from '@/lib/activity';
import { cleanupOrphanedImages, galleryJsonFilter } from '@/lib/images';

export interface ProductVariantInput {
  label: string;
  price: number;
}

export interface ProductInput {
  name: string;
  category: string;
  type: 'physical' | 'service';
  description: string;
  availability: string;
  stock: number;
  featured: boolean;
  image: string;
  gallery?: string[];
  alt: string;
  longDescription?: string;
  highlights?: string[];
  nutritionNote?: string;
  nutrition?: string[];
  benefits?: string[];
  usage?: string[];
  caution?: string;
  variants: ProductVariantInput[];
}

export type ActionResult = { ok: true; id: string } | { ok: false; error: string };

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

async function requireSession(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');
  return session.user.email ?? 'unknown user';
}

function validate(input: ProductInput): string | null {
  if (!input.name?.trim()) return 'Name is required.';
  if (!input.category?.trim()) return 'Category is required.';
  if (!input.description?.trim()) return 'Description is required.';
  if (!input.image?.trim()) return 'Image path is required.';
  if (!input.alt?.trim()) return 'Image description (alt text) is required.';
  if (!Array.isArray(input.variants) || input.variants.length === 0) {
    return 'Add at least one price variant.';
  }
  const labels = new Set<string>();
  for (const variant of input.variants) {
    if (!variant.label?.trim()) return 'Every variant needs a label (e.g. 15ml, 250g).';
    if (labels.has(variant.label.trim())) {
      return `Variant label "${variant.label.trim()}" is used more than once.`;
    }
    labels.add(variant.label.trim());
    if (!Number.isFinite(Number(variant.price)) || Number(variant.price) < 0) {
      return `Variant "${variant.label.trim()}" needs a price of zero or more.`;
    }
  }
  return null;
}

function toProductData(input: ProductInput) {
  const isService = input.type === 'service';
  return {
    name: input.name.trim(),
    category: input.category.trim(),
    type: isService ? 'service' : 'physical',
    description: input.description.trim(),
    availability: isService ? 'Bookable' : input.availability?.trim() || 'In Stock',
    stock: isService ? 0 : Math.max(0, Math.floor(Number(input.stock) || 0)),
    featured: Boolean(input.featured),
    image: input.image.trim(),
    gallery: galleryJsonFilter(input.gallery),
    alt: input.alt.trim(),
    longDescription: input.longDescription?.trim() || null,
    highlights: input.highlights && input.highlights.length > 0 ? input.highlights : Prisma.DbNull,
    nutritionNote: input.nutritionNote?.trim() || null,
    nutrition: input.nutrition && input.nutrition.length > 0 ? input.nutrition : Prisma.DbNull,
    benefits: input.benefits && input.benefits.length > 0 ? input.benefits : Prisma.DbNull,
    usage: input.usage && input.usage.length > 0 ? input.usage : Prisma.DbNull,
    caution: input.caution?.trim() || null,
  };
}

function toVariantData(input: ProductInput) {
  return input.variants.map((variant, position) => ({
    label: variant.label.trim(),
    price: round2(Number(variant.price)),
    position,
  }));
}

function basePrice(input: ProductInput): number {
  return Math.min(...toVariantData(input).map((variant) => variant.price));
}

function revalidateProductPages(id: string) {
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath(`/products/${id}`);
  revalidatePath('/admin/products');
  revalidatePath('/admin/sales');
  revalidatePath('/admin/pos');
  revalidatePath('/admin/stock');
}

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  try {
    const userEmail = await requireSession();
    const invalid = validate(input);
    if (invalid) return { ok: false, error: invalid };

    const id = slugify(input.name);
    if (!id) return { ok: false, error: 'Could not derive a valid id from the product name.' };

    const exists = await prisma.product.findUnique({ where: { id } });
    if (exists) return { ok: false, error: `A product with id "${id}" already exists.` };

    const data = toProductData(input);

    await prisma.category.upsert({
      where: { name: input.category.trim() },
      create: { name: input.category.trim() },
      update: {},
    });

    const product = await prisma.product.create({
      data: {
        id,
        ...data,
        price: basePrice(input),
        variants: { create: toVariantData(input) },
      },
    });

    if (product.stock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          delta: product.stock,
          reason: 'initial',
          note: 'Initial stock when the product was created.',
        },
      });
    }

    await logActivity({
      action: 'product.create',
      entity: 'Product',
      entityId: product.id,
      message: `Created product "${product.name}" (${product.category}) with ${product.stock} in stock.`,
      userEmail,
    });
    revalidateProductPages(id);
    await cleanupOrphanedImages();
    return { ok: true, id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to create product.',
    };
  }
}

export async function updateProduct(id: string, input: ProductInput): Promise<ActionResult> {
  try {
    const userEmail = await requireSession();
    const invalid = validate(input);
    if (invalid) return { ok: false, error: invalid };

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: 'Product not found.' };

    await prisma.category.upsert({
      where: { name: input.category.trim() },
      create: { name: input.category.trim() },
      update: {},
    });

    const data = toProductData(input);

    await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data: { ...data, price: basePrice(input) } });

      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.productVariant.createMany({
        data: toVariantData(input).map((v) => ({ ...v, productId: id })),
      });

      if (data.stock !== existing.stock) {
        await tx.stockMovement.create({
          data: {
            productId: id,
            delta: data.stock - existing.stock,
            reason: 'adjustment',
            note: `Stock edited (${existing.stock} → ${data.stock}).`,
          },
        });
      }
    });

    await logActivity({
      action: 'product.update',
      entity: 'Product',
      entityId: id,
      message: `Updated product "${data.name}".${data.stock !== existing.stock ? ` Stock: ${existing.stock} → ${data.stock}.` : ''}`,
      userEmail,
    });
    revalidateProductPages(id);
    await cleanupOrphanedImages();
    return { ok: true, id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to update product.',
    };
  }
}

export async function deleteProduct(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userEmail = await requireSession();
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: 'Product not found.' };

    await prisma.product.delete({ where: { id } });
    await logActivity({
      action: 'product.delete',
      entity: 'Product',
      entityId: id,
      message: `Deleted product "${existing.name}" (${existing.category}).`,
      userEmail,
    });
    revalidateProductPages(id);
    await cleanupOrphanedImages();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to delete product.',
    };
  }
}
