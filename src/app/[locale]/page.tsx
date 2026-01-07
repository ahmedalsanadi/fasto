import LandingPage from '@/components/pages/landing-page/landing-page';
import { storeService } from '@/services/store-service';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import {
    CategoriesGridSkeleton,
    ProductsGridSkeleton,
} from '@/components/ui/skeletons';

import { generateStoreMetadata } from '@/lib/metadata';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });
    const baseMetadata = await generateStoreMetadata(locale);

    return {
        ...baseMetadata,
        title: t('homeTitle') || 'Home',
    };
}

export default async function HomePage() {
    // Start fetching without awaiting to enable streaming
    const categoriesPromise = storeService.getCategories(true);
    const featuredProductsPromise = storeService.getProducts({
        is_featured: true,
        per_page: 8,
    });

    return (
        <Suspense
            fallback={
                <div className="container mx-auto px-4 mt-8 space-y-12">
                    <CategoriesGridSkeleton />
                    <ProductsGridSkeleton />
                </div>
            }
        >
            <LandingPage
                categoriesPromise={categoriesPromise}
                productsPromise={featuredProductsPromise}
            />
        </Suspense>
    );
}
