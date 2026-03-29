'use client';

import React, { useEffect, memo, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DriverMarker from './DriverMarker';
import type { DriverLocationState } from '../store/trackingStore';

const destinationIcon =
    typeof window !== 'undefined'
        ? L.divIcon({
              className: 'custom-div-icon',
              html: `<div class="bg-green-600 p-2 rounded-full shadow-lg border-2 border-white text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
           </div>`,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
          })
        : null;

const pickupIcon =
    typeof window !== 'undefined'
        ? L.divIcon({
              className: 'custom-div-icon',
              html: `<div class="bg-amber-500 p-2 rounded-full shadow-lg border-2 border-white text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
           </div>`,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
          })
        : null;

const MapSizeInvalidator = memo(() => {
    const map = useMap();
    useEffect(() => {
        let cancelled = false;
        const run = () => {
            if (cancelled) return;
            try {
                map.invalidateSize();
            } catch {
                /* map pane not ready */
            }
        };
        const timer = setTimeout(run, 150);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [map]);
    return null;
});
MapSizeInvalidator.displayName = 'MapSizeInvalidator';

const FitBounds = memo(({ coords }: { coords: [number, number][] }) => {
    const map = useMap();
    useEffect(() => {
        if (coords.length === 0) return;
        let cancelled = false;
        const run = () => {
            if (cancelled) return;
            try {
                if (!map.getContainer()?.parentElement) return;
                const bounds = L.latLngBounds(coords);
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
            } catch {
                /* ignore */
            }
        };
        const id = requestAnimationFrame(() => run());
        const fallback = setTimeout(run, 200);
        return () => {
            cancelled = true;
            cancelAnimationFrame(id);
            clearTimeout(fallback);
        };
    }, [coords, map]);
    return null;
});
FitBounds.displayName = 'FitBounds';

export interface TrackingMapProps {
    driver: DriverLocationState | null;
    destination: [number, number] | null;
    pickup?: [number, number] | null;
    emptyLabel?: string;
}

const TrackingMap: React.FC<TrackingMapProps> = ({
    driver,
    destination,
    pickup,
    emptyLabel,
}) => {
    const center = useMemo((): [number, number] => {
        if (driver) return [driver.latitude, driver.longitude];
        if (destination) return destination;
        if (pickup) return pickup;
        return [24.7136, 46.6753];
    }, [driver, destination, pickup]);

    const boundsPoints = useMemo(() => {
        const pts: [number, number][] = [];
        if (driver)
            pts.push([driver.latitude, driver.longitude]);
        if (destination) pts.push(destination);
        if (pickup) pts.push(pickup);
        return pts;
    }, [driver, destination, pickup]);

    if (typeof window === 'undefined') return null;

    const showEmpty = !driver && !destination && !pickup;

    if (showEmpty && emptyLabel) {
        return (
            <div
                id="order-tracking-map"
                className="w-full h-64 md:h-80 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-sm text-gray-500 px-6 text-center">
                {emptyLabel}
            </div>
        );
    }

    return (
        <div
            id="order-tracking-map"
            className="w-full h-64 md:h-80 rounded-3xl overflow-hidden border-2 border-gray-100 shadow-sm">
            <MapContainer
                center={center}
                zoom={15}
                className="w-full h-full"
                scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapSizeInvalidator />
                {boundsPoints.length > 0 && (
                    <FitBounds coords={boundsPoints} />
                )}

                {driver && (
                    <DriverMarker
                        position={[driver.latitude, driver.longitude]}
                        headingDeg={driver.heading}
                    />
                )}
                {pickup && pickupIcon && (
                    <Marker position={pickup} icon={pickupIcon} />
                )}
                {destination && destinationIcon && (
                    <Marker position={destination} icon={destinationIcon} />
                )}
            </MapContainer>
        </div>
    );
};

export default memo(TrackingMap);
