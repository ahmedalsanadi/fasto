// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { siteConfig } from '../config/site';
import { storeService } from '@/lib/api/services';

type ChangeFreq =
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';

interface RouteDef {
    path: string;
    priority: number;
    changeFrequency: ChangeFreq;
}

/**
 * Helper to generate localized versions of routes.
 */
function localizeRoutes(routes: RouteDef[]): MetadataRoute.Sitemap {
    return routing.locales.flatMap((locale) =>
        routes.map((route) => ({
            url: `${siteConfig.url}/${locale}${route.path}`,
            lastModified: new Date(),
            priority: route.priority,
            changeFrequency: route.changeFrequency,
        })),
    );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Static Routes
    const staticRoutes = localizeRoutes([
        { path: '', priority: 1, changeFrequency: 'daily' },
        { path: '/products', priority: 0.9, changeFrequency: 'daily' },
        { path: '/categories', priority: 0.8, changeFrequency: 'weekly' },
    ]);

    // 2. Dynamic Product Routes
    let productRoutes: MetadataRoute.Sitemap = [];
    try {
        const { data: products } = await storeService.getProducts({
            per_page: 50,
        });
        productRoutes = localizeRoutes(
            products.map((p) => ({
                path: `/products/${p.id}`,
                priority: 0.7,
                changeFrequency: 'weekly',
            })),
        );
    } catch {
        /* Silent */
    }

    // 3. Dynamic Category Routes
    let categoryRoutes: MetadataRoute.Sitemap = [];
    try {
        const categories = await storeService.getCategories(true);
        if (categories) {
            categoryRoutes = localizeRoutes(
                categories.map((c) => ({
                    path: `/categories/${c.id}`,
                    priority: 0.6,
                    changeFrequency: 'monthly',
                })),
            );
        }
    } catch {
        /* Silent */
    }

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
