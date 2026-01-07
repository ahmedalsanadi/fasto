import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest } from 'next/server';

const i18nMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
    return i18nMiddleware(request);
}

export const config = {
    // Match all pathnames except for:
    // - API routes
    // - Next.js internals
    // - Vercel internals
    // - Static files (favicon, etc.)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
