// src/app/proxy/[...path]/route.ts
// Next.js 16 proxy route for API requests
import { NextRequest, NextResponse } from 'next/server';
import { getBaseHeaders } from '@/services/utils';
import { env } from '@/config/env';
import { PROTECTED_API_ENDPOINTS, AUTH_COOKIES } from '@/lib/auth';
import { BRANCH_COOKIES } from '@/lib/branches/constants';

async function handleRequest(
    request: NextRequest,
    params: Promise<{ path: string[] }>,
    method: string,
) {
    const { path } = await params;
    const backendPath = `/${path.join('/')}`;
    const searchParams = request.nextUrl.searchParams.toString();

    // CHECK FOR NOMINATIM CALLS
    const isNominatim = path[0] === 'nominatim';

    // Determine if this endpoint requires authentication
    const isProtected =
        !isNominatim &&
        PROTECTED_API_ENDPOINTS.some((endpoint) =>
            backendPath.startsWith(endpoint),
        );

    // Get customer token from cookies
    const token = request.cookies.get(AUTH_COOKIES.ACCESS_TOKEN)?.value;

    // If protected endpoint and no token, return 401
    if (isProtected && !token) {
        return NextResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 },
        );
    }

    // Get headers from client request (Accept-Language, Content-Type, etc.)
    // But we'll inject X-Store-Key from server env (not from client)
    const headers = await getBaseHeaders(
        request.headers.get('Accept-Language') || 'ar',
        request.headers.get('Content-Type'),
        isProtected,
    );

    // Always inject X-Store-Key from server-side env (never from client)
    // This ensures the API key is never exposed in browser devtools
    if (!isNominatim) {
        headers.set('X-Store-Key', env.liberoApiKey);
    } else {
        // Special headers for Nominatim compatibility and policy
        headers.set(
            'User-Agent',
            'Store-Restaurant-App/1.0 (alsanadi.ahmed@gmail.com)',
        );
        // Remove Libero-specific headers for Nominatim requests
        headers.delete('X-Store-Key');
    }

    // CRITICAL: For protected endpoints, ensure Authorization header is set
    // Use the token we already read from cookies (more reliable than getBaseHeaders reading it again)
    if (isProtected && token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    let body: BodyInit | undefined;
    if (!['GET', 'HEAD'].includes(method)) {
        try {
            body = await request.arrayBuffer();
        } catch {
            /* No-op */
        }
    }

    try {
        let targetUrl = '';
        if (isNominatim) {
            const nominatimPath = `/${path.slice(1).join('/')}`;
            targetUrl = `https://nominatim.openstreetmap.org${nominatimPath}${
                searchParams ? `?${searchParams}` : ''
            }`;
            // Policy requirement: add email if not present
            if (!targetUrl.includes('email=')) {
                targetUrl +=
                    (targetUrl.includes('?') ? '&' : '?') +
                    'email=alsanadi.ahmed@gmail.com';
            }
        } else {
            targetUrl = `${env.apiUrl}${backendPath}${
                searchParams ? `?${searchParams}` : ''
            }`;
        }

        // Get branch ID from cookies
        const branchId = request.cookies.get(BRANCH_COOKIES.BRANCH_ID)?.value;

        if (branchId && !isNominatim) {
            headers.set('x-branch-id', branchId);
        }

        if (env.isDev) {
            console.log(`[Proxy] ${method} -> ${targetUrl}`, {
                isNominatim,
                hasToken: !!token,
                isProtected,
                branchId: !isNominatim ? branchId : undefined,
                authHeader: headers.get('Authorization')
                    ? 'present'
                    : 'missing',
            });
        }

        const response = await fetch(targetUrl, { method, headers, body });

        if (env.isDev) {
            console.log(
                `[Proxy Response] ${
                    response.status
                } <- ${targetUrl} (${response.headers.get('Content-Type')})`,
            );
        }

        if (response.status === 204 || response.status === 304) {
            return new NextResponse(null, { status: response.status });
        }

        const data = await response.arrayBuffer();
        return new NextResponse(data, {
            status: response.status,
            headers: {
                'Content-Type':
                    response.headers.get('Content-Type') || 'application/json',
            },
        });
    } catch (error) {
        console.error(`[Proxy Error] ${method} ${backendPath}:`, error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 },
        );
    }
}

export const GET = (
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) => handleRequest(req, params, 'GET');
export const POST = (
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) => handleRequest(req, params, 'POST');
export const PUT = (
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) => handleRequest(req, params, 'PUT');
export const PATCH = (
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) => handleRequest(req, params, 'PATCH');
export const DELETE = (
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) => handleRequest(req, params, 'DELETE');
