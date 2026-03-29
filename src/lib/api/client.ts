/**
 * API client for multi-tenant store backend.
 * On client-side uses /proxy; on server-side uses direct API URL.
 */
import { env } from '@/config/env';
import { ApiResponse } from '@/types/api';
import { getBaseHeaders } from './headers';
import { resolveTenant } from '@/lib/tenant';

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

export function getBaseUrl(): string {
    if (typeof window !== 'undefined') {
        return '/proxy';
    }
    return env.apiUrl;
}

interface FetchOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
    isProtected?: boolean;
}

function isAbortError(error: unknown): boolean {
    return (
        !!error &&
        typeof error === 'object' &&
        'name' in error &&
        (error as { name?: string }).name === 'AbortError'
    );
}

function combineSignals(
    signals: Array<AbortSignal | undefined>,
): AbortSignal | undefined {
    const active = signals.filter(Boolean) as AbortSignal[];
    if (active.length === 0) return undefined;
    if (active.length === 1) return active[0];

    // If any is already aborted, return an already-aborted signal
    if (active.some((s) => s.aborted)) {
        const c = new AbortController();
        c.abort();
        return c.signal;
    }

    // Prefer AbortSignal.any when available
    const anyFn = (
        AbortSignal as unknown as {
            any?: (signals: AbortSignal[]) => AbortSignal;
        }
    ).any;
    if (typeof anyFn === 'function') {
        return anyFn(active);
    }

    // Fallback: manual fan-in
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    active.forEach((s) => s.addEventListener('abort', onAbort, { once: true }));
    return controller.signal;
}

export async function fetchLibero<T>(
    endpoint: string,
    options: FetchOptions = {},
): Promise<T> {
    const result = await fetchLiberoFull<T>(endpoint, options);
    return result.data;
}

export async function fetchLiberoFull<T>(
    endpoint: string,
    options: FetchOptions = {},
): Promise<ApiResponse<T>> {
    const { params, isProtected, ...init } = options;
    const baseUrl = getBaseUrl();
    const externalSignal = init.signal ?? undefined;

    // Determine locale
    let locale = 'ar';
    if (typeof window !== 'undefined') {
        locale = document.documentElement.lang || 'ar';
    } else {
        try {
            const { getLocale } = await import('next-intl/server');
            locale = await getLocale();
        } catch {
            /* Default to ar */
        }
    }

    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    let url: URL;
    if (baseUrl.startsWith('/')) {
        url = new URL(
            `${baseUrl}${path}`,
            typeof window !== 'undefined'
                ? window.location.origin
                : 'http://localhost',
        );
    } else {
        url = new URL(`${baseUrl}${path}`);
    }

    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            if (v != null) url.searchParams.append(k, String(v));
        });
    }

    // For FormData body, do not set Content-Type so the browser sets it with boundary
    const isFormData = typeof init.body !== 'undefined' && init.body instanceof FormData;
    const contentTypeFromInit = (init.headers as Record<string, string>)?.['Content-Type'];
    const contentTypeForHeaders = isFormData ? 'multipart/form-data' : contentTypeFromInit;

    const headers = await getBaseHeaders(
        locale,
        contentTypeForHeaders,
        isProtected,
    );

    if (init.headers) {
        const overrideHeaders = new Headers(
            init.headers as Record<string, string>,
        );
        overrideHeaders.forEach((v, k) => {
            if (isFormData && k.toLowerCase() === 'content-type') return;
            headers.set(k, v);
        });
    }

    if (env.isDev) {
        console.log('headers after override headers are set ', headers);
        console.log(`[API] ${init.method || 'GET'} ${url.toString()}`);
    }

    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 30000);
    const signal = combineSignals([externalSignal, timeoutController.signal]);

    try {
        const initWithNext = init as RequestInit & {
            next?: { revalidate?: number; tags?: string[] };
        };
        let nextOptions = initWithNext.next
            ? { ...initWithNext.next }
            : undefined;

        if (typeof window === 'undefined') {
            try {
                const { headers: nextHeaders } = await import('next/headers');
                const requestHeaders = await nextHeaders();
                const forwarded = requestHeaders.get('x-forwarded-host');
                const host =
                    (forwarded ? forwarded.split(',')[0].trim() : null) ||
                    requestHeaders.get('host');
                const { storeKey } = resolveTenant(host);

                if (storeKey) {
                    // CRITICAL: Next.js Data Cache is keyed primarily by URL (and body).
                    // If multiple tenants share the same API URL (e.g. api.libero.com/config)
                    // but different headers, they MUST have different URLs to avoid
                    // cross-tenant cache pollution.
                    url.searchParams.set('_t', storeKey);

                    // Also include branch ID in the cache key if available
                    const { cookies } = await import('next/headers');
                    const cookieStore = await cookies();
                    const { BRANCH_COOKIES } =
                        await import('@/lib/branches/constants');
                    const branchId = cookieStore.get(
                        BRANCH_COOKIES.BRANCH_ID,
                    )?.value;
                    if (branchId) {
                        url.searchParams.set('_b', branchId);
                    }

                    // Add tenant tag for selective on-demand revalidation
                    const { CACHE_TAGS } = await import('@/config/cache');
                    const tenantTag = CACHE_TAGS.TENANT(storeKey);

                    const existingTags = nextOptions?.tags || [];
                    nextOptions = {
                        ...(nextOptions || {}),
                        tags: Array.from(new Set([...existingTags, tenantTag])),
                    };
                }
            } catch {
                /* No-op */
            }
        }

        const response = await fetch(url.toString(), {
            ...init,
            headers,
            signal: signal ?? timeoutController.signal,
            ...(nextOptions ? { next: nextOptions } : {}),
        });
        clearTimeout(timeoutId);

        if (response.status === 204) {
            return { success: true, message: '', data: {} as T };
        }

        const contentType = response.headers.get('Content-Type');
        let result: ApiResponse<T> | null = null;

        if (contentType?.includes('application/json')) {
            try {
                const jsonData = await response.json();
                result = jsonData as ApiResponse<T>;
                if (!result || typeof result !== 'object') {
                    throw new ApiError(
                        response.status,
                        'Invalid response structure from server',
                        { received: jsonData },
                    );
                }
            } catch (parseError) {
                if (parseError instanceof ApiError) throw parseError;
                try {
                    const clonedResponse = response.clone();
                    const text = await clonedResponse.text();
                    throw new ApiError(
                        response.status,
                        'Invalid JSON response from server',
                        {
                            raw: text.substring(0, 200),
                            parseError:
                                parseError instanceof Error
                                    ? parseError.message
                                    : String(parseError),
                        },
                    );
                } catch {
                    throw new ApiError(
                        response.status,
                        'Invalid JSON response from server',
                        {
                            raw: 'Unable to read response body',
                            parseError:
                                parseError instanceof Error
                                    ? parseError.message
                                    : String(parseError),
                        },
                    );
                }
            }
        } else {
            const text = await response.text();
            const errorMatch =
                text.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                text.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                text.match(/<body[^>]*>([^<]+)<\/body>/i);
            const errorMessage = errorMatch
                ? errorMatch[1]
                : `Server returned non-JSON response (${
                      contentType || 'unknown type'
                  })`;
            const errorDetails = {
                status: response.status,
                message: errorMessage,
                contentType,
                url: url.toString(),
            };
            if (env.isDev) {
                console.error(
                    `[API Error] ${init.method || 'GET'} ${path}:`,
                    errorDetails,
                );
            }
            throw new ApiError(
                response.status === 200 ? 500 : response.status,
                errorMessage,
                { ...errorDetails, raw: text.substring(0, 500) },
            );
        }

        if (!response.ok || !result || !result.success) {
            const errorMessage =
                result?.message ||
                `Request failed with status ${response.status}`;
            if (env.isDev) {
                const payload = {
                    status: response.status,
                    statusText: response.statusText,
                    message: errorMessage,
                    contentType,
                    hasResult: !!result,
                    resultSuccess: result?.success,
                    resultMessage: result?.message,
                    url: url.toString(),
                };
                console.error(
                    `[API Error] ${init.method || 'GET'} ${path}`,
                    JSON.stringify(payload, null, 2),
                );
            }
            throw new ApiError(
                response.status,
                errorMessage,
                result ?? undefined,
            );
        }

        return result;
    } catch (error: unknown) {
        clearTimeout(timeoutId);
        if (error instanceof ApiError) throw error;
        const isAbort = isAbortError(error);
        // If this was a caller-requested cancellation (TanStack Query), let it bubble
        // so the caller can treat it as a cancellation instead of showing an error.
        if (isAbort && externalSignal?.aborted) throw error;
        const isNetworkFailure =
            error instanceof Error &&
            (error.message === 'fetch failed' ||
                /timeout|ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(
                    String(
                        (error as Error & { cause?: Error }).cause?.message ??
                            error.message,
                    ),
                ));
        const message =
            isAbort || isNetworkFailure
                ? 'Network unavailable or connection timed out'
                : error instanceof Error
                  ? error.message
                  : 'Network error or store unavailable';
        throw new ApiError(isAbort ? 504 : 500, message);
    }
}
