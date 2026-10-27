import prisma from '@/lib/prisma';

export interface ProductVariantView {
  label: string;
  price: number;
}

export type ProductType = 'physical' | 'service';

export interface Product {
  id: string;
  name: string;
  category: string;
  type: ProductType;
  description: string;
  price: number;
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
  variants: ProductVariantView[];
}

export interface BlogSection {
  heading?: string;
  paragraphs: string[];
  list?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  gallery?: string[];
  alt: string;
  featured: boolean;
  sections: BlogSection[];
}

type DecimalLike = number | { toNumber(): number };

type VariantRow = { label: string; price: DecimalLike };

type ProductRow = {
  id: string;
  name: string;
  category: string;
  type: string;
  description: string;
  price: DecimalLike;
  availability: string;
  stock: number;
  featured: boolean;
  image: string;
  gallery: unknown;
  alt: string;
  longDescription: string | null;
  highlights: unknown;
  nutritionNote: string | null;
  nutrition: unknown;
  benefits: unknown;
  usage: unknown;
  caution: string | null;
  variants?: VariantRow[];
};

type PostRow = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  gallery: unknown;
  alt: string;
  featured: boolean;
  sections: unknown;
};

function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((item): item is string => typeof item === 'string');
  return items.length > 0 ? items : undefined;
}

function toSections(value: unknown): BlogSection[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      heading: typeof item.heading === 'string' && item.heading.trim() ? item.heading : undefined,
      paragraphs: toStringArray(item.paragraphs) ?? [],
      list: toStringArray(item.list),
    }))
    .filter((section) => section.paragraphs.length > 0);
}

function toNumber(value: DecimalLike): number {
  return typeof value === 'number' ? value : value.toNumber();
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    type: row.type === 'service' ? 'service' : 'physical',
    description: row.description,
    price: toNumber(row.price),
    availability: row.availability,
    stock: row.stock,
    featured: row.featured,
    image: row.image,
    gallery: toStringArray(row.gallery),
    alt: row.alt,
    longDescription: row.longDescription ?? undefined,
    highlights: toStringArray(row.highlights),
    nutritionNote: row.nutritionNote ?? undefined,
    nutrition: toStringArray(row.nutrition),
    benefits: toStringArray(row.benefits),
    usage: toStringArray(row.usage),
    caution: row.caution ?? undefined,
    variants: (row.variants ?? []).map((variant) => ({
      label: variant.label,
      price: toNumber(variant.price),
    })),
  };
}

function mapPost(row: PostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    date: row.date,
    readTime: row.readTime,
    image: row.image,
    gallery: toStringArray(row.gallery),
    alt: row.alt,
    featured: row.featured,
    sections: toSections(row.sections),
  };
}

const productInclude = { variants: { orderBy: { position: 'asc' as const } } } as const;

export async function getProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
    include: productInclude,
  });
  return rows.map((row) => mapProduct(row as unknown as ProductRow));
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const row = await prisma.product.findUnique({ where: { id }, include: productInclude });
  return row ? mapProduct(row as unknown as ProductRow) : undefined;
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { featured: true },
    orderBy: { createdAt: 'asc' },
    take: limit,
    include: productInclude,
  });
  return rows.map((row) => mapProduct(row as unknown as ProductRow));
}

export async function getProductCategories(): Promise<string[]> {
  const declared = await prisma.category.findMany({ orderBy: { createdAt: 'asc' } });
  const declaredNames = declared.map((row) => row.name);
  const fromProducts = Array.from(
    new Set(
      (await prisma.product.findMany({ select: { category: true } })).map((row) => row.category)
    )
  );
  const extras = fromProducts.filter((cat) => !declaredNames.includes(cat));
  return [...declaredNames, ...extras];
}

export function parseVariantLabels(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function getAvailableVariantLabels(): Promise<Record<string, string[]>> {
  const [declared, productRows] = await Promise.all([
    prisma.category.findMany({ select: { name: true, variantLabels: true } }),
    prisma.product.findMany({ select: { category: true, variants: { select: { label: true } } } }),
  ]);

  const managed = new Map<string, string[]>();
  for (const row of declared) {
    managed.set(row.name, parseVariantLabels(row.variantLabels));
  }

  const inUse = new Map<string, Set<string>>();
  for (const row of productRows) {
    const bucket = inUse.get(row.category) ?? new Set<string>();
    for (const variant of row.variants) {
      const label = variant.label.trim();
      if (label) bucket.add(label);
    }
    if (bucket.size > 0) inUse.set(row.category, bucket);
  }

  const available: Record<string, string[]> = {};
  for (const name of new Set([...managed.keys(), ...inUse.keys()])) {
    const base = managed.get(name) ?? [];
    const extras = [...(inUse.get(name) ?? new Set<string>())]
      .filter((label) => !base.includes(label))
      .sort((a, b) => a.localeCompare(b));
    if (base.length > 0 || extras.length > 0) available[name] = [...base, ...extras];
  }
  return available;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const rows = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  return rows.map((row) => mapPost(row as unknown as PostRow));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const row = await prisma.blogPost.findUnique({ where: { slug } });
  return row ? mapPost(row as unknown as PostRow) : undefined;
}
