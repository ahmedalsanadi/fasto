//src/app/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';
import { cookies } from 'next/headers';

function getApiUrl(): string {
    return (
        process.env.NEXT_PUBLIC_API_URL ||
        'https://store-api.libro-shop.com/api/v1'
    );
}

const DEFAULT_LOCALE = routing.defaultLocale;

/**
 * Forward selected headers from backend response to NextResponse
 */
function forwardHeaders(
    backendResponse: Response,
    nextResponse: NextResponse,
): void {
    const HEADER_ALLOWLIST = [
        'Content-Type',
        'Content-Length',
        'Content-Disposition',
        'Cache-Control',
        'ETag',
        'Last-Modified',
    ];

    HEADER_ALLOWLIST.forEach((headerName) => {
        const headerValue = backendResponse.headers.get(headerName);
        if (headerValue) {
            nextResponse.headers.set(headerName, headerValue);
        }
    });
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    return handleRequest(request, params, 'GET');
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    return handleRequest(request, params, 'POST');
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    return handleRequest(request, params, 'PATCH');
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    return handleRequest(request, params, 'PUT');
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    return handleRequest(request, params, 'DELETE');
}

async function handleRequest(
    request: NextRequest,
    params: Promise<{ path: string[] }>,
    method: string,
) {
    const API_URL = getApiUrl();
    try {
        const { path } = await params;
        const backendPath = `/${path.join('/')}`;
        const searchParams = request.nextUrl.searchParams.toString();
        const queryString = searchParams ? `?${searchParams}` : '';

        // Context Discovery
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;
        const locale = cookieStore.get('NEXT_LOCALE')?.value;

        const acceptLanguage =
            locale ||
            request.headers.get('Accept-Language')?.trim() ||
            DEFAULT_LOCALE;

        // Prepare Headers
        const headers: HeadersInit = {
            'Accept-Language': acceptLanguage,
            Accept: 'application/json',
            'X-Store-Key': process.env.LIBERO_API_KEY || '',
        };

        // Auth Injection
        const authToken = accessToken || process.env.LIBERO_AUTH_TOKEN;
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        if (request.headers.get('Content-Type')) {
            headers['Content-Type'] = request.headers.get('Content-Type')!;
        }

        // Body Handling
        let body: BodyInit | undefined;
        if (method !== 'GET' && method !== 'HEAD') {
            try {
                body = await request.arrayBuffer();
            } catch (e) {
                // Ignore empty or unreadable bodies
            }
        }

        // Fetch from Backend
        const response = await fetch(`${API_URL}${backendPath}${queryString}`, {
            method,
            headers,
            body,
        });

        // Construct Response
        const status = response.status;
        const statusText = response.statusText;

        // Special handling for No Content or Not Modified
        if (status === 204 || status === 304) {
            const nextResponse = new NextResponse(null, { status, statusText });
            forwardHeaders(response, nextResponse);
            return nextResponse;
        }

        const data = await response.arrayBuffer();
        const nextResponse = new NextResponse(data, {
            status,
            statusText,
        });

        forwardHeaders(response, nextResponse);
        return nextResponse;
    } catch (error) {
        console.error('[Proxy Error]:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 },
        );
    }
}
