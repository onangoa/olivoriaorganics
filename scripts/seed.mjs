// Seeds the database: admin user, product categories, products, and blog posts.
// Content is seeded from src/data/*.json (insert-only — existing rows are never
// overwritten, so dashboard edits made in /admin are safe if this re-runs).
// Usage: npm run db:seed   (reads .env for DB + admin credentials)
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { readFile } from 'node:fs/promises';

const prisma = new PrismaClient();

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'mysql' }),
  emailAndPassword: { enabled: true },
});

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@olivoriaorganics.com';
  const password = process.env.ADMIN_PASSWORD;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  if (!password || password.length < 8) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 characters) in .env before seeding.');
    process.exit(1);
  }

  const { data, error } = await auth.api.signUpEmail({
    body: { email, password, name: 'Olivoria Admin' },
  });

  if (error) throw new Error(error.message || 'Failed to create admin user');
  console.log(`Created admin user: ${data?.user?.email ?? email}`);
}

function parseVariants(priceString) {
  const text = String(priceString ?? '');
  const pairs = [...text.matchAll(/KSh\s*([\d,]+(?:\.\d+)?)\s*\(([^)]+)\)/g)];
  if (pairs.length > 0) {
    return pairs.map(([, amount, label]) => ({
      label: label.trim(),
      price: Number(amount.replace(/,/g, '')),
    }));
  }
  const single = text.match(/KSh\s*([\d,]+(?:\.\d+)?)/) ?? text.match(/([\d,]+(?:\.\d+)?)/);
  return [{ label: 'Standard', price: single ? Number(single[1].replace(/,/g, '')) : 0 }];
}

async function seedContent() {
  const productsFile = JSON.parse(await readFile('src/data/products.json', 'utf8'));
  const blogFile = JSON.parse(await readFile('src/data/blog.json', 'utf8'));

  // Categories — insert-only, keeps canonical order
  for (const name of productsFile.categories ?? []) {
    await prisma.category.upsert({ where: { name }, create: { name }, update: {} });
  }
  console.log(`Categories in place (${(productsFile.categories ?? []).length} declared).`);

  // Products — seeded in file order (createdAt asc = catalogue order)
  let productsAdded = 0;
  for (const p of productsFile.products ?? []) {
    const exists = await prisma.product.findUnique({ where: { id: p.id } });
    if (exists) continue;
    const variants = parseVariants(p.price);
    const basePrice = Math.min(...variants.map((v) => v.price));
    const stock = Math.max(0, Math.floor(Number(p.stock) || 0));
    const product = await prisma.product.create({
      data: {
        id: p.id,
        name: p.name,
        category: p.category,
        type: p.type === 'service' ? 'service' : 'physical',
        description: p.description,
        price: basePrice,
        availability: p.availability,
        featured: Boolean(p.featured),
        image: p.image,
        gallery: Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : undefined,
        alt: p.alt,
        longDescription: p.longDescription ?? null,
        highlights: p.highlights ?? null,
        nutritionNote: p.nutritionNote ?? null,
        nutrition: p.nutrition ?? null,
        benefits: p.benefits ?? null,
        usage: p.usage ?? null,
        caution: p.caution ?? null,
        stock,
        variants: {
          create: variants.map((variant, position) => ({
            label: variant.label,
            price: variant.price,
            position,
          })),
        },
      },
    });
    if (stock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          delta: stock,
          reason: 'initial',
          note: 'Initial stock when the product was created.',
        },
      });
    }
    productsAdded++;
  }
  console.log(`Products seeded: ${productsAdded} added.`);

  // Posts — seeded in reverse file order so newest-first ordering by createdAt matches the file
  let postsAdded = 0;
  for (const post of [...(blogFile.posts ?? [])].reverse()) {
    const exists = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (exists) continue;
    await prisma.blogPost.create({
      data: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        date: post.date,
        readTime: post.readTime,
        image: post.image,
        gallery: Array.isArray(post.gallery) && post.gallery.length > 0 ? post.gallery : undefined,
        alt: post.alt,
        featured: Boolean(post.featured),
        sections: post.sections ?? null,
      },
    });
    postsAdded++;
  }
  console.log(`Blog posts seeded: ${postsAdded} added.`);
}

async function main() {
  await seedAdmin();
  await seedContent();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
