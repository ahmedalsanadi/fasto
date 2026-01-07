import { env } from '@/config/env';
import { ApiResponse } from './types';
import { getBaseHeaders } from './utils';

/**
 * Custom Error class for API failures.
 */
export class ApiError extends Error {
    constructor(
        public status: number,
        public message: string,
        public data?: unknown,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Returns the base URL for API requests.
 * Uses proxy for client-side to avoid CORS/security leaks.
 */
export function getBaseUrl(): string {
    return typeof window !== 'undefined' ? '/proxy' : env.apiUrl;
}

interface FetchOptions extends RequestInit {
    params?: Record<string, string | number | boolean>;
}

/**
 * Core fetch wrapper for the Libero API.
 */
export async function fetchLibero<T>(
    endpoint: string,
    options: FetchOptions = {},
): Promise<T> {
    const result = await fetchLiberoFull<T>(endpoint, options);
    return result.data;
}

/**
 * Fetch wrapper that returns the full ApiResponse structure.
 * Useful when pagination meta is needed.
 */
export async function fetchLiberoFull<T>(
    endpoint: string,
    options: FetchOptions = {},
): Promise<ApiResponse<T>> {
    const { params, ...init } = options;
    const baseUrl = getBaseUrl();

    let locale: string | undefined;
    if (typeof window === 'undefined') {
        try {
            const { getLocale } = await import('next-intl/server');
            locale = await getLocale();
        } catch {
            /* No-op */
        }
    } else {
        locale = document.documentElement.lang;
    }

    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${baseUrl}${path}`);

    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            if (v != null) url.searchParams.append(k, String(v));
        });
    }

    const headers = getBaseHeaders(
        locale,
        (init.headers as Record<string, string> | undefined)?.['Content-Type'],
    );

    if (init.headers) {
        new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    }

    try {
        const response = await fetch(url.toString(), { ...init, headers });

        if (response.status === 204) {
            return { success: true, message: '', data: {} as T };
        }

        const result: ApiResponse<T> = await response.json();

        if (!response.ok || !result.success) {
            throw new ApiError(
                response.status,
                result.message || 'API Request Failed',
                result.data,
            );
        }

        return result;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error(`[API Error] ${endpoint}:`, error);
        throw new ApiError(500, 'Network error or server unavailable');
    }
}
