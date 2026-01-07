import React from 'react';
import ProductsContent from '@/components/pages/products/ProductsContent';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/getQueryClient';
import { storeService } from '@/lib/api/services';

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const { category: slug } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'Product' });

    let title = `${t('products')} | ${siteConfig.name}`;

    if (slug) {
        try {
            const categories = await storeService.getCategories(true);
            const cat = categories.find((c) => c.slug === slug);
            if (cat) {
                title = `${cat.title} | ${siteConfig.name}`;
            }
        } catch (e) {
            // Silently fall back to default title
        }
    }

    return {
        title,
        description: t('description'),
        alternates: {
            canonical: `${siteConfig.url}/${locale}/products${
                slug ? `?category=${slug}` : ''
            }`,
        },
        openGraph: {
            title,
            description: t('description'),
            url: `${siteConfig.url}/${locale}/products${
                slug ? `?category=${slug}` : ''
            }`,
            type: 'website',
        },
    };
}

export default async function ProductsPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ category?: string }>;
}) {
    const { locale } = await params;
    const { category: categorySlug } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'Product' });
    const queryClient = getQueryClient();

    // Prefetch data on the server with real service
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: ['categories'],
            queryFn: () => storeService.getCategories(true),
        }),
        queryClient.prefetchQuery({
            queryKey: ['products', { category_id: categorySlug }],
            queryFn: () =>
                storeService.getProducts({
                    category_id: categorySlug,
                    per_page: 12,
                }),
        }),
    ]);

    const breadcrumbItems = [
        { label: t('home'), href: '/' },
        { label: t('products'), href: '/products', active: true },
    ];

    return (
        <main className="min-h-screen bg-gray-50/30">
            <div className="container mx-auto px-4 pt-6">
                <Breadcrumbs items={breadcrumbItems} />
            </div>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <ProductsContent
                    initialCategorySlug={categorySlug}
                    locale={locale}
                />
            </HydrationBoundary>
        </main>
    );
}
