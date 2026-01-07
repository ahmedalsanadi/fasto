//src/app/[locale]/page.tsx
//landing page
import LandingPage from '@/components/pages/landing-page/LandingPage';
import { storeService } from '@/lib/api/services';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

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
        <LandingPage
            categoriesPromise={categoriesPromise}
            productsPromise={featuredProductsPromise}
        />
    );
}
