import productsJson from '@/data/products.json';
import blogJson from '@/data/blog.json';

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  availability: string;
  featured: boolean;
  image: string;
  alt: string;
  longDescription?: string;
  highlights?: string[];
  nutritionNote?: string;
  nutrition?: string[];
  benefits?: string[];
  usage?: string[];
  caution?: string;
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
  alt: string;
  featured: boolean;
  sections: BlogSection[];
}

const products: Product[] = productsJson.products;
const blogPosts: BlogPost[] = blogJson.posts;

export function getProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getFeaturedProducts(limit = 6): Product[] {
  return products.filter((product) => product.featured).slice(0, limit);
}

export function getProductCategories(): string[] {
  return Array.from(new Set(products.map((product) => product.category)));
}

export function getBlogPosts(): BlogPost[] {
  return blogPosts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
