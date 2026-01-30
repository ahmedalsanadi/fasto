// src/components/modals/AddressMap.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_MAP_ZOOM } from '@/lib/branches';

// Initialize Leaflet icons
const createDefaultIcon = () => {
    if (typeof window === 'undefined') return null;

    return L.icon({
        iconUrl: '/images/leaflet/marker-icon.png',
        iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
        shadowUrl: '/images/leaflet/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });
};

if (typeof window !== 'undefined') {
    const defaultIcon = createDefaultIcon();
    if (defaultIcon) {
        L.Marker.prototype.options.icon = defaultIcon;
    }
}

interface AddressMapProps {
    center: [number, number];
    onLocationSelect: (location: [number, number], formatted: string) => void;
    searchQuery?: string;
}

// Component to handle map clicks
const MapClickHandler = ({
    onLocationSelect,
}: {
    onLocationSelect: (location: [number, number], formatted: string) => void;
}) => {
    useMapEvents({
        click: async (e) => {
            const { lat, lng } = e.latlng;
            try {
                // Use the unified proxy to bypass CORS and Nominatim restrictions
                const response = await fetch(
                    `/proxy/nominatim/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
                );
                if (!response.ok)
                    throw new Error('Network response was not ok');
                const data = await response.json();

                const formatted =
                    data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                onLocationSelect([lat, lng], formatted);
            } catch (error) {
                console.error('Reverse geocoding error:', error);
                const formatted = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                onLocationSelect([lat, lng], formatted);
            }
        },
    });
    return null;
};

// Component to update map center
const ChangeView = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        if (map) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

// Component to invalidate map size when container becomes visible
const MapSizeInvalidator = () => {
    const map = useMap();
    useEffect(() => {
        // Invalidate size after a short delay to ensure container is visible
        const timer = setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

const AddressMap: React.FC<AddressMapProps> = ({
    center,
    onLocationSelect,
    searchQuery,
}) => {
    const [mounted, setMounted] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<
        [number, number] | null
    >(center);
    const [mapCenter, setMapCenter] = useState<[number, number]>(center);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (center) {
            setSelectedLocation(center);
            setMapCenter(center);
        }
    }, [center]);

    // Handle geocoding search query with debounce
    useEffect(() => {
        if (!searchQuery || !searchQuery.trim()) return;

        const timer = setTimeout(async () => {
            try {
                // Use the unified proxy for search to bypass CORS
                const response = await fetch(
                    `/proxy/nominatim/search?format=json&q=${encodeURIComponent(
                        searchQuery,
                    )}&accept-language=ar`,
                );
                if (!response.ok) throw new Error('Search failed');
                const data = await response.json();

                if (data && data.length > 0) {
                    const { lat, lon, display_name } = data[0];
                    const newLocation: [number, number] = [
                        parseFloat(lat),
                        parseFloat(lon),
                    ];
                    setMapCenter(newLocation);
                    setSelectedLocation(newLocation);
                    onLocationSelect(newLocation, display_name);
                }
            } catch (error) {
                console.error('Geocoding error:', error);
            }
        }, 800); // 800ms debounce

        return () => clearTimeout(timer);
    }, [searchQuery, onLocationSelect]);
    const handleLocationSelect = useCallback(
        (location: [number, number], formatted: string) => {
            setSelectedLocation(location);
            setMapCenter(location);
            onLocationSelect(location, formatted);
        },
        [onLocationSelect],
    );

    // Only render map when mounted and on client
    if (typeof window === 'undefined' || !mounted) {
        return (
            <div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center">
                <div className="text-sm text-gray-400">Loading map...</div>
            </div>
        );
    }

    return (
        <MapContainer
            center={mapCenter}
            zoom={DEFAULT_MAP_ZOOM}
            className="w-full h-full rounded-2xl"
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            scrollWheelZoom={true}
            key={`map-${mounted}`}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView center={mapCenter} />
            <MapSizeInvalidator />
            <MapClickHandler onLocationSelect={handleLocationSelect} />
            {selectedLocation && <Marker position={selectedLocation} />}
        </MapContainer>
    );
};

export default AddressMap;
