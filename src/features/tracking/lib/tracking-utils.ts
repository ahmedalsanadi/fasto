import type {
    CaptainLocation,
    CaptainLocationUpdatedPayload,
    OrderTrackingCaptain,
} from '@/types/orders/tracking.types';
import type { DriverLocationState } from '../store/trackingStore';

export function captainLocationToDriverState(
    loc: CaptainLocation | null | undefined,
): DriverLocationState | null {
    if (!loc) return null;
    const lat = Number(loc.latitude);
    const lng = Number(loc.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return {
        latitude: lat,
        longitude: lng,
        heading:
            loc.heading != null && Number.isFinite(Number(loc.heading))
                ? Number(loc.heading)
                : null,
        speed:
            loc.speed != null && Number.isFinite(Number(loc.speed))
                ? Number(loc.speed)
                : null,
        updatedAt: loc.updated_at ?? null,
    };
}

export function captainToDriverState(
    captain: OrderTrackingCaptain | null | undefined,
): DriverLocationState | null {
    if (!captain?.location) return null;
    return captainLocationToDriverState(captain.location);
}

export function parseLocationEventPayload(
    raw: unknown,
    depth = 0,
): DriverLocationState | null {
    if (depth > 4) return null;
    if (raw && typeof raw === 'object' && 'data' in raw) {
        return parseLocationEventPayload(
            (raw as { data: unknown }).data,
            depth + 1,
        );
    }
    if (!raw || typeof raw !== 'object') return null;
    const p = raw as CaptainLocationUpdatedPayload;
    const lat = Number(p.latitude);
    const lng = Number(p.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return {
        latitude: lat,
        longitude: lng,
        heading:
            p.heading != null && Number.isFinite(Number(p.heading))
                ? Number(p.heading)
                : null,
        speed:
            p.speed != null && Number.isFinite(Number(p.speed))
                ? Number(p.speed)
                : null,
        updatedAt: p.timestamp ?? null,
    };
}

export function coordsFromTrackingAddress(
    addr: Record<string, unknown> | null | undefined,
): [number, number] | null {
    if (!addr) return null;
    const lat = Number(addr.latitude);
    const lng = Number(addr.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return [lat, lng];
}

export function isNewerOrEqual(
    prevIso: string | null | undefined,
    nextIso: string | null | undefined,
): boolean {
    if (!nextIso) return true;
    if (!prevIso) return true;
    return new Date(nextIso).getTime() >= new Date(prevIso).getTime();
}
