//src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getMessages, getTranslations } from 'next-intl/server';
import { setupLocale } from '@/i18n/setup-locale';
import { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { siteConfig } from '../../config/site';
import '../globals.css';
import { Toaster } from 'sonner';
import { ShoppingCart } from 'lucide-react';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
    variable: '--font-ibm-plex-sans-arabic',
    subsets: ['arabic'],
    weight: ['400', '500', '700'],
});

// Extract domain to a constant to avoid repetition
const DOMAIN = siteConfig.url;

import PageContainer from '@/components/layouts/PageContainer';

import { QueryProvider } from '@/components/providers/query-provider';

import { getStoreConfig } from '@/lib/api/config';
import { StoreProvider } from '@/components/providers/store-provider';
import { generateStoreMetadata } from '@/lib/metadata';

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Validate and setup locale
    setupLocale(locale);

    const isArabic = locale === 'ar';
    const messages = await getMessages({ locale });

    // 1. Fetch Store Config with caching
    const storeConfig = await getStoreConfig();

    return (
        <html
            lang={locale}
            dir={isArabic ? 'rtl' : 'ltr'}
            suppressHydrationWarning>
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

                        {/* JSON-LD Structured Data */}
                        <script
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{
                                __html: JSON.stringify({
                                    '@context': 'https://schema.org',
                                    '@type': 'LocalBusiness',
                                    name: storeConfig.store.name,
                                    description: storeConfig.store.slogan,
                                    url: DOMAIN,
                                    logo: storeConfig.store.logo_url,
                                    image: storeConfig.store.logo_url,
                                    inLanguage: locale,
                                    address: {
                                        '@type': 'PostalAddress',
                                        addressCountry: 'SA',
                                    },
                                }),
                            }}
                        />
                    </>
                )}
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexSansArabic.variable} antialiased font-sans transition-colors duration-300`}
                suppressHydrationWarning>
                {!storeConfig ? (
                    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                        <div className="max-w-md w-full p-8 text-center bg-white rounded-3xl shadow-2xl border border-red-50">
                            <div className="text-5xl mb-6">🍕</div>
                            <h1 className="text-2xl font-black text-gray-900 mb-2">
                                Service Unavailable
                            </h1>
                            <p className="text-gray-500 mb-8">
                                We're having trouble connecting to our servers.
                                Please try again later.
                            </p>
                            <button
                                onClick={() =>
                                    typeof window !== 'undefined' &&
                                    window.location.reload()
                                }
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-200">
                                Retry Connection
                            </button>
                        </div>
                    </div>
                ) : (
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem
                        disableTransitionOnChange>
                        <NextIntlClientProvider
                            locale={locale}
                            messages={messages}>
                            <StoreProvider config={storeConfig}>
                                <QueryProvider>
                                    <PageContainer>{children}</PageContainer>

                                    <Toaster
                                        position={
                                            isArabic ? 'top-right' : 'top-left'
                                        }
                                        expand={false}
                                        richColors
                                        closeButton
                                        dir={isArabic ? 'rtl' : 'ltr'}
                                        toastOptions={{
                                            className:
                                                'font-ibm-plex-sans-arabic rounded-2xl p-4 shadow-2xl border-0 bg-white/90 backdrop-blur-xl',
                                            actionButtonStyle: {
                                                backgroundColor: 'transparent',
                                                color:
                                                    storeConfig.theme
                                                        .primary_color ||
                                                    '#FF5200',
                                                fontWeight: '700',
                                            },
                                        }}
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
