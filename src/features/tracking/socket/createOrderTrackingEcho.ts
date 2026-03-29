'use client';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { env } from '@/config/env';
import { getBaseHeaders } from '@/lib/api/headers';

let pusherRegistered = false;

function registerPusher() {
    if (typeof window === 'undefined' || pusherRegistered) return;
    window.Pusher = Pusher;
    pusherRegistered = true;
}

/**
 * Browser-only Echo client for Reverb (Pusher protocol).
 * Private channel auth goes through same-origin `/proxy/broadcasting/auth` so cookies + tenant headers apply.
 */
export function createOrderTrackingEcho() {
    if (typeof window === 'undefined') {
        throw new Error('createOrderTrackingEcho must run in the browser');
    }
    registerPusher();

    const useTls = env.reverbScheme === 'https';
    const port = env.reverbPort || (useTls ? 443 : 8080);

    return new Echo({
        broadcaster: 'reverb',
        key: env.reverbAppKey,
        wsHost: env.reverbHost,
        wsPort: port,
        wssPort: port,
        forceTLS: useTls,
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
        cluster: '',
        authorizer: (channel) => ({
            authorize: async (socketId, callback) => {
                try {
                    const locale = document.documentElement.lang || 'ar';
                    const headers = await getBaseHeaders(
                        locale,
                        'application/x-www-form-urlencoded',
                        true,
                    );
                    const body = new URLSearchParams({
                        socket_id: socketId,
                        channel_name: channel.name,
                    });
                    const res = await fetch(
                        `${window.location.origin}/proxy/broadcasting/auth`,
                        {
                            method: 'POST',
                            headers,
                            credentials: 'same-origin',
                            body: body.toString(),
                        },
                    );
                    if (!res.ok) {
                        callback(
                            new Error(`Broadcast auth failed: ${res.status}`),
                            null,
                        );
                        return;
                    }
                    const data = (await res.json()) as { auth: string };
                    callback(null, data);
                } catch (err) {
                    callback(err instanceof Error ? err : new Error(String(err)), null);
                }
            },
        }),
    });
}
