import type { MetadataRoute } from 'next';
import { appUrl } from '@/server/config';
export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/guide', '/evidence', '/privacy', '/lab', '/wallet-check'].map((path) => ({
    url: `${appUrl()}${path}`,
    lastModified: new Date('2026-11-20'),
    changeFrequency: 'weekly',
    priority: path ? 0.6 : 1,
  }));
}
