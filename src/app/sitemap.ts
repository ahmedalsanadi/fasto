//src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { siteConfig } from '../config/site';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = siteConfig.url;

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        ...routing.locales.map((locale) => ({
            url: `${baseUrl}/${locale}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        })),
    ];
}
