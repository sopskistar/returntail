import type { MetadataRoute } from 'next';
import { appUrl } from '@/server/config';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/workspace', '/pay/', '/resolution/', '/login', '/register'],
    },
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
