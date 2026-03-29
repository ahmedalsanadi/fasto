// src/components/modals/AddressMap.tsx
'use client';

import React, { useEffect, useCallback, useRef, memo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    useMap,
    ZoomControl,
} from 'react-leaflet';
import { Check, MapPin, Search } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_MAP_ZOOM } from '@/lib/branches';
import { DEFAULT_COORDINATES } from '@/lib/address/constants';
import { forwardGeocode, reverseGeocode } from '@/lib/address/geocoding';
import { cn } from '@/lib/utils';

// Initialize Leaflet icon once at module level
const DEFAULT_ICON =
    typeof window !== 'undefined'
        ? L.icon({
              iconUrl: '/images/leaflet/marker-icon.png',
              iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
              shadowUrl: '/images/leaflet/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
          })
        : null;

if (typeof window !== 'undefined' && DEFAULT_ICON) {
    L.Marker.prototype.options.icon = DEFAULT_ICON;
}

const SEARCH_DEBOUNCE_MS = 800;

interface AddressMapProps {
    center: [number, number];
    onLocationSelect: (location: [number, number], formatted: string) => void;
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    searchLabel?: string;
    searchPlaceholder?: string;
    formattedAddress?: string;
    locationSelectedLabel?: string;
    locationNotSelectedLabel?: string;
}

const MapClickHandler = memo(
    ({
        onSelect,
        setHasInteracted,
    }: {
        onSelect: (loc: [number, number], formatted: string) => void;
        setHasInteracted: (v: boolean) => void;
    }) => {
        const abortControllerRef = useRef<AbortController | null>(null);

        useMapEvents({
            click: async (e) => {
                setHasInteracted(true);
                abortControllerRef.current?.abort();
                abortControllerRef.current = new AbortController();
                const { lat, lng } = e.latlng;
                try {
                    const formatted = await reverseGeocode(
                        lat,
                        lng,
                        abortControllerRef.current.signal,
                    );
                    onSelect([lat, lng], formatted);
                } catch (error) {
                    if (error instanceof Error && error.name !== 'AbortError') {
                        onSelect(
                            [lat, lng],
                            `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                        );
                    }
                }
            },
        });

        useEffect(() => () => abortControllerRef.current?.abort(), []);
        return null;
    },
);
MapClickHandler.displayName = 'MapClickHandler';

const MapViewUpdater = memo(({ center }: { center: [number, number] }) => {
    const map = useMap();
    const prevCenterRef = useRef(center);
    useEffect(() => {
        let cancelled = false;
        const run = () => {
            if (cancelled) return;
            try {
                if (
                    prevCenterRef.current[0] !== center[0] ||
                    prevCenterRef.current[1] !== center[1]
                ) {
                    if (map.getContainer()?.parentElement) {
                        map.setView(center, map.getZoom());
                        prevCenterRef.current = center;
                    }
                }
            } catch {
                // ignore if map pane not ready (_leaflet_pos)
            }
        };
        const id = requestAnimationFrame(() => run());
        return () => {
            cancelled = true;
            cancelAnimationFrame(id);
        };
    }, [center, map]);
    return null;
});
MapViewUpdater.displayName = 'MapViewUpdater';

const MapSizeInvalidator = memo(() => {
    const map = useMap();
    useEffect(() => {
        let cancelled = false;
        const run = () => {
            if (cancelled) return;
            try {
                map.invalidateSize();
            } catch {
                // ignore if map pane not ready
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

const ScrollWheelZoomEnabler = memo(() => {
    const map = useMap();
    useEffect(() => {
        let cancelled = false;
        const id = setTimeout(() => {
            if (cancelled) return;
            try {
                if (map.scrollWheelZoom && !map.scrollWheelZoom.enabled()) {
                    map.scrollWheelZoom.enable();
                }
            } catch {
                // ignore
            }
        }, 400);
        return () => {
            cancelled = true;
            clearTimeout(id);
        };
    }, [map]);
    return null;
});
ScrollWheelZoomEnabler.displayName = 'ScrollWheelZoomEnabler';

const AddressMap: React.FC<AddressMapProps> = ({
    center,
    onLocationSelect,
    searchQuery,
    onSearchChange,
    searchLabel,
    searchPlaceholder,
    formattedAddress,
    locationSelectedLabel,
    locationNotSelectedLabel,
}) => {
    const t = useTranslations('Address');
    const [hasInteracted, setHasInteracted] = useState(false);

    const isDefaultLocation =
        Math.abs(center[0] - DEFAULT_COORDINATES[0]) < 0.0001 &&
        Math.abs(center[1] - DEFAULT_COORDINATES[1]) < 0.0001;

    const handleLocationSelect = useCallback(
        (location: [number, number], formatted: string) => {
            setHasInteracted(true);
            onLocationSelect(location, formatted);
        },
        [onLocationSelect],
    );

    const abortRef = useRef<AbortController | null>(null);
    const lastQueryRef = useRef('');

    useEffect(() => {
        const q = searchQuery?.trim() || '';
        if (!q || q === lastQueryRef.current) return;
        const timer = setTimeout(async () => {
            abortRef.current?.abort();
            abortRef.current = new AbortController();
            try {
                const res = await forwardGeocode(q, abortRef.current.signal);
                if (res) {
                    handleLocationSelect([res.lat, res.lon], res.display_name);
                    lastQueryRef.current = q;
                }
            } catch {}
        }, SEARCH_DEBOUNCE_MS);
        return () => {
            clearTimeout(timer);
            abortRef.current?.abort();
        };
    }, [searchQuery, handleLocationSelect]);

    if (typeof window === 'undefined') return null;

    const hasResolvedAddress = Boolean(formattedAddress?.trim());

    return (
        <div className="relative w-full h-full isolate">
            <MapContainer
                center={center}
                zoom={DEFAULT_MAP_ZOOM}
                className="w-full h-full rounded-2xl"
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                scrollWheelZoom={false}
                zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ZoomControl position="topleft" />
                <MapViewUpdater center={center} />
                <MapSizeInvalidator />
                <ScrollWheelZoomEnabler />
                <MapClickHandler
                    onSelect={handleLocationSelect}
                    setHasInteracted={setHasInteracted}
                />
                <Marker position={center} />
            </MapContainer>

            {/* Search lives on the map; zoom stays top-right (Leaflet) so this bar stays clear */}
            {onSearchChange != null && (
                <div className="pointer-events-auto absolute right-3 left-14 top-3 z-1100 sm:right-4 sm:left-16 sm:top-4">
                    <label htmlFor="address-map-search" className="sr-only">
                        {searchLabel ?? searchPlaceholder}
                    </label>
                    <div className="relative">
                        <Search
                            className="pointer-events-none absolute end-2.5 top-1/2 z-1 size-4 -translate-y-1/2 text-gray-400 sm:end-3 sm:size-[18px]"
                            aria-hidden
                        />
                        <input
                            id="address-map-search"
                            type="search"
                            enterKeyHint="search"
                            autoComplete="street-address"
                            value={searchQuery ?? ''}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={searchPlaceholder}
                            aria-label={searchLabel ?? searchPlaceholder}
                            className={cn(
                                'w-full min-h-[44px] rounded-xl border border-white/80 bg-white/95 py-2.5 ps-3 pe-10 text-sm font-medium text-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md outline-none ring-1 ring-black/5 transition-[box-shadow,ring]',
                                'placeholder:text-gray-400 focus:border-theme-primary/40 focus:ring-2 focus:ring-theme-primary/25 sm:min-h-[48px] sm:rounded-2xl sm:ps-4 sm:pe-11 sm:text-base',
                            )}
                        />
                    </div>
                </div>
            )}

            {/* Bottom status: always visible above map edge — no need to scroll to verify */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-1100 px-3 pb-3 pt-10 sm:px-4 sm:pb-4 sm:pt-12">
                <div
                    className={cn(
                        'pointer-events-auto mx-auto max-w-full rounded-xl border px-3 py-2.5 shadow-lg backdrop-blur-md sm:rounded-2xl sm:px-4 sm:py-3',
                        hasResolvedAddress
                            ? 'border-theme-primary/20 bg-white/95'
                            : 'border-gray-200/80 bg-white/90',
                    )}>
                    <div className="flex items-start gap-2 sm:gap-3">
                        {hasResolvedAddress ? (
                            <Check className="mt-0.5 size-4 shrink-0 text-theme-primary sm:size-5" />
                        ) : (
                            <MapPin className="mt-0.5 size-4 shrink-0 text-gray-400 sm:size-5" />
                        )}
                        <div className="min-w-0 flex-1">
                            <p
                                className={cn(
                                    'text-[9px] font-bold uppercase tracking-wide sm:text-[10px]',
                                    hasResolvedAddress
                                        ? 'text-theme-primary/80'
                                        : 'text-gray-400',
                                )}>
                                {hasResolvedAddress
                                    ? locationSelectedLabel
                                    : locationNotSelectedLabel}
                            </p>
                            {hasResolvedAddress ? (
                                <p className="mt-0.5 line-clamp-3 text-[11px] font-medium leading-snug text-theme-primary/95 sm:line-clamp-4 sm:text-sm">
                                    {formattedAddress}
                                </p>
                            ) : (
                                (hasInteracted || !isDefaultLocation) && (
                                    <p className="mt-0.5 text-[10px] leading-snug text-gray-500 sm:text-xs">
                                        {t('mapPickLocationHint')}
                                    </p>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {!hasInteracted && isDefaultLocation && (
                <div className="pointer-events-none absolute inset-0 z-1000 flex items-center justify-center px-4 pb-36 pt-24 sm:px-6 sm:pb-44 sm:pt-28">
                    <div className="bg-white/95 backdrop-blur-md px-4 py-3 shadow-2xl border border-theme-primary/10 flex flex-col items-center gap-2 rounded-2xl sm:px-6 sm:py-4 sm:rounded-3xl max-w-[min(100%,20rem)]">
                        <div className="flex size-10 items-center justify-center rounded-full bg-theme-primary/10 sm:size-11">
                            <div className="size-3 rounded-full bg-theme-primary animate-ping" />
                        </div>
                        <p className="text-center text-xs font-black uppercase tracking-tight text-theme-primary sm:text-sm">
                            {t('mapPickLocationTitle')}
                        </p>
                        <p className="text-center text-[10px] font-bold text-gray-400 sm:text-[11px]">
                            {t('mapPickLocationHint')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(AddressMap);
