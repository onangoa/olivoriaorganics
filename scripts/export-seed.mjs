// Exports rows that exist in the database but are missing from the seed files
// (src/data/products.json and src/data/blog.json), so a fresh environment can
// be seeded with the full live catalogue. Existing seed entries are never
// modified - only missing entries are appended (products/categories at the end,
// blog posts at the front since that file is ordered newest-first).
// Usage: npm run db:export-seed
import { PrismaClient } from '@prisma/client';
import { readFile, writeFile } from 'node:fs/promises';

const prisma = new PrismaClient();

function fmtPrice(value) {
  const n = Number(value);
  return n % 1 === 0
    ? n.toLocaleString('en-US')
    : n.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

function priceString(variants) {
  if (!variants || variants.length === 0) return 'KSh 0';
  if (variants.length === 1 && variants[0].label === 'Standard') {
    return `KSh ${fmtPrice(variants[0].price)}`;
  }
  return variants.map((v) => `KSh ${fmtPrice(v.price)} (${v.label})`).join(' / ');
}

function cleanText(value) {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function cleanList(value) {
  return Array.isArray(value) && value.some((x) => typeof x === 'string' && x.trim())
    ? value
    : undefined;
}

async function exportProducts() {
  const file = JSON.parse(await readFile('src/data/products.json', 'utf8'));
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { variants: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' }, select: { name: true } }),
  ]);

  const known = new Set(file.products.map((p) => p.id));
  const missing = products.filter((p) => !known.has(p.id));

  const exported = missing.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    type: p.type === 'service' ? 'service' : undefined,
    description: p.description,
    price: priceString(p.variants),
    availability: p.availability,
    featured: p.featured,
    image: p.image,
    alt: p.alt,
    stock: p.stock > 0 ? p.stock : undefined,
    gallery: cleanList(p.gallery),
    longDescription: cleanText(p.longDescription),
    highlights: cleanList(p.highlights),
    nutritionNote: cleanText(p.nutritionNote),
    nutrition: cleanList(p.nutrition),
    benefits: cleanList(p.benefits),
    usage: cleanList(p.usage),
    caution: cleanText(p.caution),
  }));

  // Categories: keep the declared order, append any live categories not yet declared
  const declared = file.categories ?? [];
  const newCategories = categories.map((c) => c.name).filter((name) => !declared.includes(name));

  // Sync live stock counts into existing entries. Only used when seeding a
  // fresh environment - existing DB rows are never overwritten by db:seed.
  let stockSynced = 0;
  const byId = new Map(file.products.map((p) => [p.id, p]));
  for (const product of products) {
    const entry = byId.get(product.id);
    if (!entry) continue;
    if (product.stock > 0) {
      if (entry.stock !== product.stock) {
        entry.stock = product.stock;
        stockSynced++;
      }
    } else if (entry.stock !== undefined) {
      delete entry.stock;
      stockSynced++;
    }
  }

  if (exported.length > 0 || newCategories.length > 0 || stockSynced > 0) {
    file.products = [...file.products, ...exported];
    if (newCategories.length > 0) file.categories = [...declared, ...newCategories];
    await writeFile('src/data/products.json', JSON.stringify(file, null, 2) + '\n');
  }

  console.log(
    `Products seed file: ${exported.length} exported, ${newCategories.length} categories added, ${stockSynced} stock values synced.`
  );
}

async function exportPosts() {
  const file = JSON.parse(await readFile('src/data/blog.json', 'utf8'));
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });

  const known = new Set(file.posts.map((p) => p.slug));
  const missing = posts.filter((p) => !known.has(p.slug));

  const exported = missing.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    date: p.date,
    readTime: p.readTime,
    image: p.image,
    alt: p.alt,
    featured: p.featured,
    gallery: cleanList(p.gallery),
    sections: p.sections ?? undefined,
  }));

  if (exported.length > 0) {
    // Blog seed file is ordered newest-first, so new posts are prepended
    file.posts = [...exported, ...file.posts];
    await writeFile('src/data/blog.json', JSON.stringify(file, null, 2) + '\n');
  }

  console.log(`Blog seed file: ${exported.length} exported.`);
}

async function main() {
  await exportProducts();
  await exportPosts();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
