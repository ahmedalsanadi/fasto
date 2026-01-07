//src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { setupLocale } from '@/i18n/setup-locale';
import { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { siteConfig } from '@/config/site';
import { Toaster } from 'sonner';

import '@/app/globals.css';
import PageContainer from '@/components/layouts/page-container';
import { ServiceUnavailableFallback } from '@/components/layouts/service-unavailable-fallback';
import { QueryProvider } from '@/components/providers/query-provider';
import { getStoreConfig } from '@/services/store-config';
import { StoreProvider } from '@/components/providers/store-provider';
import { generateStoreMetadata, generateStructuredData } from '@/lib/metadata';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});
const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
    variable: '--font-ibm-plex-sans-arabic',
    subsets: ['arabic'],
    weight: ['400', '500', '700'],
});

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setupLocale(locale);

    const isArabic = locale === 'ar';
    const messages = await getMessages({ locale });
    const storeConfig = await getStoreConfig();
    const structuredData = generateStructuredData(
        storeConfig,
        locale,
        siteConfig.url,
    );

    return (
        <html
            lang={locale}
            dir={isArabic ? 'rtl' : 'ltr'}
            suppressHydrationWarning
        >
            <head>
                {storeConfig && (
                    <>
                        <link
                            rel="icon"
                            href={storeConfig.store.logo_url || '/favicon.ico'}
                        />
                        <meta
                            name="theme-color"
                            content={
                                storeConfig.theme.primary_color || '#FF5200'
                            }
                        />
                        {structuredData && (
                            <script
                                type="application/ld+json"
                                dangerouslySetInnerHTML={{
                                    __html: JSON.stringify(structuredData),
                                }}
                            />
                        )}
                    </>
                )}
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexSansArabic.variable} antialiased font-sans`}
                suppressHydrationWarning
            >
                {!storeConfig ? (
                    <ServiceUnavailableFallback />
                ) : (
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem
                    >
                        <NextIntlClientProvider
                            locale={locale}
                            messages={messages}
                        >
                            <StoreProvider config={storeConfig}>
                                <QueryProvider>
                                    <PageContainer>{children}</PageContainer>
                                    <Toaster
                                        position={
                                            isArabic ? 'top-right' : 'top-left'
                                        }
                                        richColors
                                        dir={isArabic ? 'rtl' : 'ltr'}
                                    />
                                </QueryProvider>
                            </StoreProvider>
                        </NextIntlClientProvider>
                    </ThemeProvider>
                )}
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    return generateStoreMetadata(locale);
}
