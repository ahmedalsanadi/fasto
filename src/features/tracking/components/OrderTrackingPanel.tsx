'use client';

import React, { memo, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api';
import { formatOrderTime } from '@/lib/utils';
import { useOrderTracking } from '../hooks/useOrderTracking';
import { coordsFromTrackingAddress } from '../lib/tracking-utils';
import { OrderCourierCard } from '@/components/orders/OrderCourierCard';

const TrackingMap = dynamic(
    () => import('@/features/tracking/components/TrackingMap'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-80 bg-gray-100 animate-pulse rounded-3xl" />
        ),
    },
);

export interface OrderTrackingPanelProps {
    orderId: number;
    /** Parent decides (e.g. timeline status === SHIPPED). */
    isActive: boolean;
}

/**
 * Shipped-order column: courier card, map or backend message, connection hint.
 * Isolated so OrderDetailsView does not own tracking wiring or Leaflet chunk.
 */
function OrderTrackingPanelComponent({
    orderId,
    isActive,
}: OrderTrackingPanelProps) {
    const t = useTranslations('Orders');
    const {
        tracking: trackingPayload,
        driverLocation,
        connectionStatus,
        isLoading: isTrackingLoading,
        isError: isTrackingError,
        error: trackingQueryError,
    } = useOrderTracking(orderId, { enabled: isActive });

    const trackingBackendRejected =
        trackingQueryError instanceof ApiError &&
        trackingQueryError.status === 400;

    const destinationCoords = useMemo((): [number, number] | null => {
        return coordsFromTrackingAddress(
            trackingPayload?.delivery_address as
                | Record<string, unknown>
                | undefined,
        );
    }, [trackingPayload?.delivery_address]);

    const pickupCoords = useMemo((): [number, number] | null => {
        return coordsFromTrackingAddress(
            trackingPayload?.pickup_address as
                | Record<string, unknown>
                | undefined,
        );
    }, [trackingPayload?.pickup_address]);

    const scrollToTrackingMap = useCallback(() => {
        document
            .getElementById('order-tracking-map')
            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, []);

    if (!isActive) return null;

    return (
        <>
            <OrderCourierCard
                captainName={trackingPayload?.captain?.name}
                captainPhone={trackingPayload?.captain?.phone}
                onTrackOnMap={scrollToTrackingMap}
            />
            {isTrackingLoading ?
                <div className="w-full h-64 md:h-80 bg-gray-100 animate-pulse rounded-3xl border-2 border-gray-100" />
            : trackingBackendRejected ?
                <div className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600 leading-relaxed">
                    {trackingQueryError.message}
                </div>
            :   <TrackingMap
                    driver={driverLocation}
                    destination={destinationCoords}
                    pickup={pickupCoords ?? undefined}
                    emptyLabel={t('tracking.waitingDriver')}
                />
            }
            {!isTrackingLoading &&
                isTrackingError &&
                !trackingBackendRejected && (
                    <p className="text-xs text-amber-700 px-1">
                        {t('tracking.mapError')}
                    </p>
                )}
            {!isTrackingLoading && (
                <div className="flex flex-col gap-1 text-xs text-gray-500 px-1">
                    <span>
                        {connectionStatus === 'live' && t('tracking.live')}
                        {connectionStatus === 'connecting' &&
                            t('tracking.connecting')}
                        {connectionStatus === 'polling' && t('tracking.polling')}
                    </span>
                    {driverLocation?.updatedAt && (
                        <span>
                            {t('tracking.lastUpdated', {
                                time: formatOrderTime(driverLocation.updatedAt),
                            })}
                        </span>
                    )}
                </div>
            )}
        </>
    );
}

export const OrderTrackingPanel = memo(OrderTrackingPanelComponent);
