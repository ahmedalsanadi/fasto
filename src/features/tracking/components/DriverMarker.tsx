'use client';

import React, { memo, useMemo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

interface DriverMarkerProps {
    position: [number, number];
    headingDeg: number | null;
}

const DriverMarker = memo(function DriverMarker({
    position,
    headingDeg,
}: DriverMarkerProps) {
    const icon = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const rotation =
            headingDeg != null && Number.isFinite(headingDeg)
                ? `rotate(${headingDeg}deg)`
                : 'none';
        return L.divIcon({
            className: 'driver-marker-leaflet',
            html: `<div style="transform:${rotation};transform-origin:center center;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
              <div class="bg-theme-primary p-2 rounded-full shadow-lg border-2 border-white text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              </div>
            </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
        });
    }, [headingDeg]);

    if (!icon) return null;

    return <Marker position={position} icon={icon} />;
});

export default DriverMarker;
