import { MetadataRoute } from 'next';
import { getBlogPosts } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0, changeFrequency: 'weekly' },
    { url: `${baseUrl}/products`, lastModified: new Date(), priority: 0.9, changeFrequency: 'weekly' },
    { url: `${baseUrl}/consultations`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
    { url: `${baseUrl}/health-reform`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
    { url: `${baseUrl}/blog`, lastModified: new Date(), priority: 0.7, changeFrequency: 'weekly' },
    ...getBlogPosts().map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(),
      priority: 0.6,
      changeFrequency: 'monthly' as const,
    })),
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.7, changeFrequency: 'monthly' },
    { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.6, changeFrequency: 'monthly' },
  ];
}
