'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { ApiError } from '@/lib/api';
import { env } from '@/config/env';
import { getOrderTracking } from '../api/getTracking';
import { createOrderTrackingEcho } from '../socket/createOrderTrackingEcho';
import { useTrackingStore } from '../store/trackingStore';
import type { OrderTrackingData } from '@/types/orders/tracking.types';
import {
    captainToDriverState,
    isNewerOrEqual,
    parseLocationEventPayload,
} from '../lib/tracking-utils';
import type { DriverLocationState } from '../store/trackingStore';

type ReverbEcho = ReturnType<typeof createOrderTrackingEcho>;

export type TrackingConnectionStatus =
    | 'idle'
    | 'loading'
    | 'connecting'
    | 'live'
    | 'polling'
    | 'stopped';

const SHIPPED_STATUS_VALUE = 6;

function useThrottledDriverUpdate(
    setDriverLocation: (loc: DriverLocationState | null) => void,
) {
    const rafRef = useRef<number | null>(null);
    const pendingRef = useRef<DriverLocationState | null>(null);

    return useCallback(
        (loc: DriverLocationState) => {
            pendingRef.current = loc;
            if (rafRef.current != null) return;
            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null;
                const next = pendingRef.current;
                if (next) {
                    const prev = useTrackingStore.getState().driverLocation;
                    if (isNewerOrEqual(prev?.updatedAt, next.updatedAt)) {
                        setDriverLocation(next);
                    }
                }
            });
        },
        [setDriverLocation],
    );
}

export interface UseOrderTrackingResult {
    tracking: OrderTrackingData | undefined;
    driverLocation: DriverLocationState | null;
    connectionStatus: TrackingConnectionStatus;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useOrderTracking(
    orderId: number,
    options?: { enabled?: boolean },
): UseOrderTrackingResult {
    const enabled = options?.enabled ?? true;
    const setSession = useTrackingStore((s) => s.setSession);
    const clearSession = useTrackingStore((s) => s.clearSession);
    const setDriverLocation = useTrackingStore((s) => s.setDriverLocation);
    const driverLocation = useTrackingStore((s) =>
        s.activeOrderId === orderId ? s.driverLocation : null,
    );

    const [pusherMode, setPusherMode] = useState<
        'off' | 'trying' | 'live' | 'failed'
    >('off');

    const echoRef = useRef<ReverbEcho | null>(null);
    const connectFailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const trackingDataRef = useRef<OrderTrackingData | undefined>(undefined);
    const applyLiveLocation = useThrottledDriverUpdate(setDriverLocation);

    const canUseWs = Boolean(
        env.reverbAppKey && env.reverbHost && typeof window !== 'undefined',
    );

    const queryEnabled = enabled && Number.isFinite(orderId) && orderId > 0;

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['tracking', orderId],
        queryFn: () => getOrderTracking(orderId),
        staleTime: 30_000,
        enabled: queryEnabled,
        retry: (failureCount, err) => {
            if (err instanceof ApiError && err.status === 400) return false;
            return failureCount < 2;
        },
        refetchInterval: (q) => {
            const d = q.state.data as OrderTrackingData | undefined;
            const shipped = d?.order_status?.value === SHIPPED_STATUS_VALUE;
            if (!d || !shipped) return false;
            if (!canUseWs) return 10_000;
            if (pusherMode === 'live') return false;
            if (pusherMode === 'failed') return 10_000;
            return false;
        },
    });

    const isShipped = data?.order_status?.value === SHIPPED_STATUS_VALUE;

    const wsEventKey =
        data && isShipped
            ? (data.websocket?.event ?? 'captain.location.updated')
            : null;

    const connectionStatus = useMemo((): TrackingConnectionStatus => {
        if (!queryEnabled) return 'idle';
        if (isLoading) return 'loading';
        if (!data) return 'idle';
        if (!isShipped) return 'stopped';
        if (!canUseWs || pusherMode === 'failed') return 'polling';
        if (pusherMode === 'live') return 'live';
        return 'connecting';
    }, [
        queryEnabled,
        isLoading,
        data,
        isShipped,
        canUseWs,
        pusherMode,
    ]);

    useEffect(() => {
        trackingDataRef.current = data;
    }, [data]);

    useEffect(() => {
        if (!queryEnabled) {
            clearSession();
            return;
        }
        setSession(orderId);
        return () => {
            clearSession();
        };
    }, [queryEnabled, orderId, setSession, clearSession]);

    useEffect(() => {
        if (!data || useTrackingStore.getState().activeOrderId !== orderId)
            return;
        const fromCaptain = captainToDriverState(data.captain);
        if (!fromCaptain) return;
        const prev = useTrackingStore.getState().driverLocation;
        if (isNewerOrEqual(prev?.updatedAt, fromCaptain.updatedAt)) {
            setDriverLocation(fromCaptain);
        }
    }, [data, orderId, setDriverLocation]);

    useEffect(() => {
        if (!queryEnabled || !isShipped || wsEventKey == null) {
            setPusherMode('off');
            return;
        }

        const snapshot = trackingDataRef.current;
        if (!snapshot) {
            setPusherMode('off');
            return;
        }

        if (!canUseWs) {
            setPusherMode('failed');
            return;
        }

        setPusherMode('trying');
        let cancelled = false;
        const eventName =
            snapshot.websocket?.event || 'captain.location.updated';
        const channelName = `order.${orderId}.tracking`;

        let echo: ReverbEcho;
        try {
            echo = createOrderTrackingEcho();
        } catch {
            setPusherMode('failed');
            return;
        }
        echoRef.current = echo;

        const pusher = echo.connector?.pusher;
        if (!pusher?.connection) {
            setPusherMode('failed');
            return () => {
                cancelled = true;
            };
        }

        const onConnected = () => {
            if (cancelled) return;
            if (connectFailTimerRef.current) {
                clearTimeout(connectFailTimerRef.current);
                connectFailTimerRef.current = null;
            }
            setPusherMode('live');
        };

        const onDisconnected = () => {
            if (cancelled) return;
            setPusherMode('failed');
        };

        const onError = () => {
            if (cancelled) return;
            setPusherMode('failed');
        };

        const onUnavailable = () => {
            if (cancelled) return;
            setPusherMode('failed');
        };

        pusher.connection.bind('connected', onConnected);
        pusher.connection.bind('disconnected', onDisconnected);
        pusher.connection.bind('error', onError);
        pusher.connection.bind('unavailable', onUnavailable);

        connectFailTimerRef.current = setTimeout(() => {
            if (cancelled) return;
            const state = pusher.connection?.state;
            if (state !== 'connected') {
                setPusherMode('failed');
            }
        }, 12_000);

        const channel = echo.private(channelName);

        const handler = (payload: unknown) => {
            const loc = parseLocationEventPayload(payload);
            if (loc) applyLiveLocation(loc);
        };

        channel.listen(`.${eventName}`, handler);

        return () => {
            cancelled = true;
            if (connectFailTimerRef.current) {
                clearTimeout(connectFailTimerRef.current);
                connectFailTimerRef.current = null;
            }
            pusher.connection.unbind('connected', onConnected);
            pusher.connection.unbind('disconnected', onDisconnected);
            pusher.connection.unbind('error', onError);
            pusher.connection.unbind('unavailable', onUnavailable);
            try {
                echo.leave(channelName);
            } catch {
                /* noop */
            }
            try {
                echo.disconnect();
            } catch {
                /* noop */
            }
            echoRef.current = null;
            setPusherMode('off');
        };
    }, [
        queryEnabled,
        orderId,
        isShipped,
        canUseWs,
        applyLiveLocation,
        wsEventKey,
    ]);

    return {
        tracking: data,
        driverLocation,
        connectionStatus,
        isLoading,
        isError,
        error: error instanceof Error ? error : null,
        refetch,
    };
}
