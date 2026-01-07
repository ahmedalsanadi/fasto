// src/app/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getBaseHeaders, isPathForbidden } from '@/lib/api/utils';

function getApiUrl(): string {
    return (
        process.env.NEXT_PUBLIC_API_URL ||
        'https://store-api.libro-shop.com/api/v1'
    );
}

async function handleRequest(
    request: NextRequest,
    params: Promise<{ path: string[] }>,
    method: string,
) {
    const API_URL = getApiUrl();
    const { path } = await params;

    if (isPathForbidden(path)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const backendPath = `/${path.join('/')}`;
    const searchParams = request.nextUrl.searchParams.toString();
    const cookieStore = await cookies();

    // Prepare Headers
    const headers = getBaseHeaders(
        cookieStore.get('NEXT_LOCALE')?.value ||
            request.headers.get('Accept-Language') ||
            undefined,
        request.headers.get('Content-Type'),
    );

    // Dynamic Auth (if user is logged in via cookie)
    const clientAccessToken = cookieStore.get('accessToken')?.value;
    if (clientAccessToken) {
        headers.set('Authorization', `Bearer ${clientAccessToken}`);
    }

    let body: BodyInit | undefined;
    if (!['GET', 'HEAD'].includes(method)) {
        try {
            body = await request.arrayBuffer();
        } catch {
            /* Ignore */
        }
    }

    try {
        const response = await fetch(
            `${API_URL}${backendPath}${searchParams ? `?${searchParams}` : ''}`,
            {
                method,
                headers,
                body,
            },
        );

        // Forward status and body
        if (response.status === 204 || response.status === 304) {
            return new NextResponse(null, { status: response.status });
        }

        const data = await response.arrayBuffer();
        const nextResponse = new NextResponse(data, {
            status: response.status,
        });

        // Forward essential headers
        ['Content-Type', 'Cache-Control', 'ETag'].forEach((h) => {
            const val = response.headers.get(h);
            if (val) nextResponse.headers.set(h, val);
        });

        return nextResponse;
    } catch (error) {
        console.error(`[Proxy Error] ${method} ${backendPath}:`, error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 },
        );
    }
}

// Handler Factory to avoid repetition
const createMethod =
    (method: string) =>
    (req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) =>
        handleRequest(req, params, method);

export const GET = createMethod('GET');
export const POST = createMethod('POST');
export const PUT = createMethod('PUT');
export const PATCH = createMethod('PATCH');
export const DELETE = createMethod('DELETE');
