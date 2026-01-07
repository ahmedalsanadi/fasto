//src/lib/api/client.ts
import { getBaseUrl } from './config';
import { ApiResponse } from './types';

export class ApiError extends Error {
    constructor(
        public status: number,
        public message: string,
        public data?: any,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

interface FetchOptions extends RequestInit {
    params?: Record<string, string | number | boolean>;
}

export async function fetchLibero<T>(
    endpoint: string,
    options: FetchOptions = {},
): Promise<T> {
    const { params, ...init } = options;
    const baseUrl = getBaseUrl();

    // Localization discovery
    let locale: string | undefined;

    if (typeof window === 'undefined') {
        try {
            // Server-side: use next-intl/server to get the locale
            // We use dynamic import to avoid bundling this in client-side code
            const { getLocale } = await import('next-intl/server');
            locale = await getLocale();
        } catch (error) {
            console.warn('[API Client] Failed to get server locale:', error);
        }
    } else {
        // Client-side: use document lang
        locale = document.documentElement.lang;
    }

    // Normalize endpoint (ensure leading slash)
    const normalizedEndpoint = endpoint.startsWith('/')
        ? endpoint
        : `/${endpoint}`;

    // Build URL with query params
    const url = new URL(`${baseUrl}${normalizedEndpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        });
    }

    const headers = new Headers(init.headers);

    if (locale) {
        headers.set('Accept-Language', locale);
    }

    // Server-side header injection
    if (typeof window === 'undefined') {
        const storeKey = process.env.LIBERO_API_KEY;
        const authToken = process.env.LIBERO_AUTH_TOKEN;

        if (storeKey) {
            headers.set('X-Store-Key', storeKey);
        }
        if (authToken) {
            headers.set('Authorization', `Bearer ${authToken}`);
        }
    }

    if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
    }
    if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    try {
        const response = await fetch(url.toString(), {
            ...init,
            headers,
        });

        // Handle empty responses
        if (response.status === 204) {
            return {} as T;
        }

        const result: ApiResponse<T> = await response.json();

        if (!response.ok || !result.success) {
            throw new ApiError(
                response.status,
                result.message || 'An unexpected error occurred',
                result.data,
            );
        }

        return result.data;
    } catch (error) {
        if (error instanceof ApiError) throw error;

        console.error(`[API Error] ${endpoint}:`, error);
        throw new ApiError(500, 'Network error or server unavailable');
    }
}
