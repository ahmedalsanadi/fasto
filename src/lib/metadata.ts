import { getTranslations } from 'next-intl/server';
import { getStoreConfig } from '@/services/store-config';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { StoreConfig } from '@/services/types';

/**
 * Generates base metadata for the store.
 */
export async function generateStoreMetadata(locale: string): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: 'Metadata' });
    const storeConfig = await getStoreConfig();

    const title = storeConfig?.store.name || t('title');
    const description = storeConfig?.store.slogan || t('description');
    const logoUrl =
        storeConfig?.store.logo_url || `${siteConfig.url}/og-image.png`;

    return {
        title: {
            template: `%s | ${title}`,
            default: title,
        },
        description,
        keywords: t('keywords'),
        openGraph: {
            title,
            description,
            url: siteConfig.url,
            siteName: title,
            images: [{ url: logoUrl, width: 1200, height: 630, alt: title }],
            locale: locale,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [logoUrl],
        },
        alternates: {
            canonical: siteConfig.url,
            languages: {
                en: `${siteConfig.url}/en`,
                ar: `${siteConfig.url}/ar`,
            },
        },
    };
}

/**
 * Generates JSON-LD for LocalBusiness.
 */
export function generateStructuredData(
    storeConfig: StoreConfig | null,
    locale: string,
    domain: string,
) {
    if (!storeConfig) return null;

    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: storeConfig.store.name,
        description: storeConfig.store.slogan,
        url: domain,
        logo: storeConfig.store.logo_url,
        image: storeConfig.store.logo_url,
        inLanguage: locale,
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'SA',
        },
    };
}
