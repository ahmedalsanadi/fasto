import { env } from '@/config/env';

/**
 * Standardize header construction for both server-side and proxy requests.
 */
export function getBaseHeaders(locale?: string, contentType?: string | null) {
    const headers = new Headers({
        Accept: 'application/json',
        'Accept-Language': locale || 'ar',
        'X-Store-Key': env.liberoApiKey,
    });

    if (contentType && !contentType.includes('multipart/form-data')) {
        headers.set('Content-Type', contentType);
    } else if (!contentType) {
        headers.set('Content-Type', 'application/json');
    }

    if (env.liberoAuthToken) {
        headers.set('Authorization', `Bearer ${env.liberoAuthToken}`);
    }

    return headers;
}

/**
 * Security check for proxy paths.
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
