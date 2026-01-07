import { storeService } from './services';
import { StoreConfig } from './types';

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

/**
 * Fetches store configuration.
 * Temporarily direct fetch without unstable_cache to debug "Service Unavailable" issue.
 */
export async function getStoreConfig(): Promise<StoreConfig | null> {
    try {
        console.log('[Config] Fetching store config...');
        const config = await storeService.getConfig();
        console.log('[Config] Successfully fetched store config');
        return config;
    } catch (error) {
        console.error('[Config] Failed to fetch store config:', error);
        return null;
    }
}
