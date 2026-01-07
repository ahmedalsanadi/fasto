/**
 * Centralized environment variable management.
 * This ensures we have a single place to handle defaults and validation.
 */

export const env = {
    // API Keys & Tokens
    liberoApiKey: process.env.LIBERO_API_KEY || '',
    liberoAuthToken: process.env.LIBERO_AUTH_TOKEN || '',

    // URLs
    apiUrl:
        process.env.NEXT_PUBLIC_API_URL ||
        'https://store-api.libro-shop.com/api/v1',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://fasto.vercel.app',

    // Environment
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
};
