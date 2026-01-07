// src/lib/api/utils.ts
import { routing } from '@/i18n/routing';

export const DEFAULT_LOCALE = routing.defaultLocale;

/**
 * Standardize header construction for both server-side and proxy requests.
 */
export function getBaseHeaders(locale?: string, contentType?: string | null) {
    const headers = new Headers({
        Accept: 'application/json',
        'Accept-Language': locale || DEFAULT_LOCALE,
        'X-Store-Key': process.env.LIBERO_API_KEY || '',
    });

    if (contentType && !contentType.includes('multipart/form-data')) {
        headers.set('Content-Type', contentType);
    } else if (!contentType) {
        headers.set('Content-Type', 'application/json');
    }

    const authToken = process.env.LIBERO_AUTH_TOKEN;
    if (authToken) {
        headers.set('Authorization', `Bearer ${authToken}`);
    }

    return headers;
}

/**
 * Validates if a path is allowed to be accessed via the proxy.
 */
export function isPathForbidden(path: string[]): boolean {
    const forbiddenKeywords = [
        'internal',
        'env',
        'setup',
        'config.php',
        'wp-admin',
        'admin',
    ];
    return forbiddenKeywords.some((keyword) => path.includes(keyword));
}

/**
 * Simple CSS color validator.
 */
export function isValidColor(color: string): boolean {
    return (
        /^#([A-Fa-f0-9]{3}){1,2}$/.test(color) ||
        /^rgba?\((\d{1,3}%?,\s?){2,3}\d{1,3}%?\)$/.test(color) ||
        /^[a-z]+$/.test(color)
    );
}
