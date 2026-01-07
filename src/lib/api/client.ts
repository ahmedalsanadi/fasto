// src/lib/api/client.ts
import { getBaseUrl } from './config';
import { ApiResponse } from './types';
import { getBaseHeaders } from './utils';

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

    // Context discovery (Smarter locale detection)
    let locale: string | undefined;
    if (typeof window === 'undefined') {
        try {
            const { getLocale } = await import('next-intl/server');
            locale = await getLocale();
        } catch {
            /* Silent */
        }
    } else {
        locale = document.documentElement.lang;
    }

    const url = new URL(
        `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`,
    );
    if (params) {
        Object.entries(params).forEach(
            ([k, v]) => v != null && url.searchParams.append(k, String(v)),
        );
    }

    // Use shared header utility
    const headers = getBaseHeaders(
        locale,
        (init.headers as any)?.['Content-Type'],
    );

    // Merge any additional custom headers
    if (init.headers) {
        new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    }

    try {
        const response = await fetch(url.toString(), { ...init, headers });
        if (response.status === 204) return {} as T;

        const result: ApiResponse<T> = await response.json();
        if (!response.ok || !result.success) {
            throw new ApiError(
                response.status,
                result.message || 'API Error',
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
