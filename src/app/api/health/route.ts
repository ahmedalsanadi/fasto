// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

interface HealthStatus {
    status: string;
    timestamp: string;
    uptime: number;
    memory: NodeJS.MemoryUsage;
    node_version: string;
    env: string;
    externalApi?: {
        status: string;
        latency?: string;
        statusCode?: number;
        message?: string;
    };
}

export async function GET() {
    const health: HealthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        node_version: process.version,
        env: process.env.NODE_ENV || 'development',
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

        health.externalApi = {
            status: response.ok ? 'connected' : 'unavailable',
            latency: `${duration}ms`,
            statusCode: response.status,
        };
    } catch (error) {
        health.externalApi = {
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
