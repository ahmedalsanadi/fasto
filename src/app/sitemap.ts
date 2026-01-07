import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { siteConfig } from '@/config/site';
import { storeService } from '@/services/store-service';

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
        { path: '/my-orders', priority: 0.5, changeFrequency: 'monthly' },
        { path: '/cart', priority: 0.5, changeFrequency: 'monthly' },
    ]);

    // 2. Dynamic Product Routes
    let productRoutes: MetadataRoute.Sitemap = [];
    try {
        const { data: products } = await storeService.getProducts({
            per_page: 100,
        });
        productRoutes = localizeRoutes(
            products.map((p) => ({
                path: `/products/${p.id}`,
                priority: 0.7,
                changeFrequency: 'weekly',
            })),
        );
    } catch {
        /* Silent fallback */
    }

    // 3. Dynamic Category Routes (Assuming they use ?category=slug or similar, but if we want direct links:)
    let categoryRoutes: MetadataRoute.Sitemap = [];
    try {
        const categories = await storeService.getCategories(true);
        if (categories) {
            categoryRoutes = localizeRoutes(
                categories.map((c) => ({
                    path: `/products?category=${c.slug}`,
                    priority: 0.6,
                    changeFrequency: 'monthly',
                })),
            );
        }
    } catch {
        /* Silent fallback */
    }

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
