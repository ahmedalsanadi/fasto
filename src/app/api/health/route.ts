// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        node_version: process.version,
        env: process.env.NODE_ENV,
    };

    // Check external API health
    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        'https://store-api.libro-shop.com/api/v1';
    try {
        const start = Date.now();
        const response = await fetch(`${apiUrl}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });
        const duration = Date.now() - start;

        (health as any).externalApi = {
            status: response.ok ? 'connected' : 'unavailable',
            latency: `${duration}ms`,
            statusCode: response.status,
        };
    } catch (error) {
        (health as any).externalApi = {
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }

    return NextResponse.json(health, {
        headers: {
            'Cache-Control': 'no-store, max-age=0',
            'X-Health-Check': 'True',
        },
    });
}
