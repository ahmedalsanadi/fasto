import { storeService } from './store-service';
import { StoreConfig } from './types';

// Simple in-memory cache for server-side requests (request-scoped)
let cachedStoreConfig: StoreConfig | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 3600 * 1000; // 1 hour

/**
 * Optimized fetch for store configuration with basic caching.
 */
export async function getStoreConfig(): Promise<StoreConfig | null> {
    const now = Date.now();

    if (cachedStoreConfig && now - lastFetchTime < CACHE_TTL) {
        return cachedStoreConfig;
    }

    try {
        const config = await storeService.getConfig();
        cachedStoreConfig = config;
        lastFetchTime = now;
        return config;
    } catch (error) {
        console.error('[StoreConfig] Failed to fetch:', error);
        return null;
    }
}
