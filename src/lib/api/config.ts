//src/lib/api/config.ts
import { unstable_cache } from 'next/cache';
import { storeService } from './services';
import { StoreConfig } from './types';

/**
 * Cached version of store configuration.
 * Uses Next.js Data Cache to avoid repeated API calls.
 */
export const getStoreConfig = unstable_cache(
    async (): Promise<StoreConfig | null> => {
        try {
            return await storeService.getConfig();
        } catch (error) {
            console.error('[Config] Failed to fetch store config:', error);
            return null;
        }
    },
    ['store-config'],
    {
        revalidate: 3600, // 1 hour
        tags: ['store-config'],
    },
);

/**
 * Returns the base URL for API requests.
 * Client-side requests are routed through the /proxy endpoint to avoid CORS issues and secure keys.
 * Server-side requests can hit the API directly for better performance.
 */
export function getBaseUrl(): string {
    if (typeof window !== 'undefined') {
        return '/proxy';
    }
    return (
        process.env.NEXT_PUBLIC_API_URL ||
        'https://store-api.libro-shop.com/api/v1'
    );
}
