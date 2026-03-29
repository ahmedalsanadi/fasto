//src/config/env.ts
/**
 * Centralized environment variable management.
 * This ensures we have a single place to handle defaults and validation.
 */

export const env = {
    // API Keys & Tokens
    liberoApiKey:
        process.env.NEXT_PUBLIC_LIBERO_API_KEY ||
        process.env.LIBERO_API_KEY ||
        '',

    // URLs
    apiUrl:
        process.env.NEXT_PUBLIC_API_URL ||
        'https://store-api.libro-shop.com/api/v1',

    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://fasto.vercel.app',

    // Tenant resolution
    storeDefaultKey: process.env.STORE_DEFAULT_KEY || '',
    storeDomainMap: process.env.STORE_DOMAIN_MAP || '',
    allowDefaultStoreKeyInProd:
        process.env.ALLOW_DEFAULT_STORE_KEY_IN_PROD === 'true',
    allowDefaultStoreKeyOnPlatformHosts:
        process.env.ALLOW_DEFAULT_STORE_KEY_ON_PLATFORM_HOSTS === 'true',

    /** Force hero type per deployment when API returns wrong store_type (e.g. "restaurant" | "store"). */
    storeHeroType:
        (process.env.NEXT_PUBLIC_STORE_HERO_TYPE || '').trim().toLowerCase() ||
        null,

    // Laravel Reverb (Pusher protocol) — browser WebSocket to Reverb host
    reverbAppKey: process.env.NEXT_PUBLIC_REVERB_APP_KEY || '',
    reverbHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'ws.libro-shop.com',
    reverbPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT || '443'),
    reverbScheme:
        (process.env.NEXT_PUBLIC_REVERB_SCHEME || 'https').toLowerCase(),

    // Environment
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
};
