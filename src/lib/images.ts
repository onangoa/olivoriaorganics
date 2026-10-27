import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const UPLOAD_URL_PREFIX = '/api/images/';
const ORPHAN_GRACE_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 hours

export function uploadedImageId(url: string): string | null {
  if (!url.startsWith(UPLOAD_URL_PREFIX)) return null;
  const id = url.slice(UPLOAD_URL_PREFIX.length);
  return /^[a-z0-9]+$/i.test(id) ? id : null;
}

function collectImageIds(values: unknown, ids: Set<string>) {
  if (typeof values === 'string') {
    const id = uploadedImageId(values);
    if (id) ids.add(id);
  } else if (Array.isArray(values)) {
    for (const value of values) {
      const id = typeof value === 'string' ? uploadedImageId(value) : null;
      if (id) ids.add(id);
    }
  }
}

/**
 * Deletes uploaded images that are no longer referenced by any product or blog
 * post. Only images older than 24 hours are removed, so photos uploaded but not
 * yet saved (e.g. a form still being filled in) are left alone.
 */
export async function cleanupOrphanedImages(): Promise<number> {
  const cutoff = new Date(Date.now() - ORPHAN_GRACE_PERIOD_MS);

  const [products, posts] = await Promise.all([
    prisma.product.findMany({ select: { image: true, gallery: true } }),
    prisma.blogPost.findMany({ select: { image: true, gallery: true } }),
  ]);

  const referenced = new Set<string>();
  for (const row of [...products, ...posts]) {
    collectImageIds(row.image, referenced);
    collectImageIds(row.gallery, referenced);
  }

  const candidates = await prisma.image.findMany({
    where: { createdAt: { lt: cutoff } },
    select: { id: true },
  });

  const orphans = candidates.filter((image) => !referenced.has(image.id));
  if (orphans.length === 0) return 0;

  await prisma.image.deleteMany({
    where: { id: { in: orphans.map((image) => image.id) } },
  });
  return orphans.length;
}

export function galleryJsonFilter(gallery: string[] | undefined) {
  return gallery && gallery.length > 0 ? gallery : Prisma.DbNull;
}
