import { getAllTools } from '@/config/tools';
import { routing } from '@/i18n/routing';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'snaptools.co';
  const baseUrl = `https://${domain}`;
  const tools = getAllTools();
  const locales = routing.locales;

  const entries: MetadataRoute.Sitemap = [];

  // Hub pages (one per locale)
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: Object.fromEntries([
          ...locales.map((loc) => [loc, `${baseUrl}/${loc}`]),
          ['x-default', `${baseUrl}/en`],
        ]),
      },
    });
  }

  // Tool pages (one per tool per locale)
  for (const tool of tools) {
    for (const locale of locales) {
      if (tool.locales[locale]) {
        entries.push({
          url: `${baseUrl}/${locale}/tools/${tool.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: {
            languages: Object.fromEntries([
              ...Object.keys(tool.locales)
                .filter((loc) => locales.includes(loc as 'en' | 'fr'))
                .map((loc) => [loc, `${baseUrl}/${loc}/tools/${tool.slug}`]),
              ['x-default', `${baseUrl}/en/tools/${tool.slug}`],
            ]),
          },
        });
      }
    }
  }

  // Legal pages
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    });
    entries.push({
      url: `${baseUrl}/${locale}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    });
  }

  return entries;
}
