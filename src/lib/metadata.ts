//src/lib/metadata.ts
import { getTranslations } from 'next-intl/server';
import { getStoreConfig } from './api/config';
import { Metadata } from 'next';
import { siteConfig } from '../config/site';

/**
 * Generates base metadata for the store.
 * Centralizes duplicate logic from layouts and pages.
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
            images: [
                {
                    url: logoUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
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
