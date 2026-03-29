/**
 * GET /store/orders/{id}/tracking — customer order tracking (REST + WebSocket hints).
 */

export interface OrderTrackingStatus {
    value: number;
    label: string;
}

export interface CaptainLocation {
    latitude: number;
    longitude: number;
    heading?: number | null;
    speed?: number | null;
    updated_at?: string | null;
}

export interface OrderTrackingCaptain {
    id: number;
    name: string;
    phone: string | null;
    location: CaptainLocation | null;
}

export interface OrderTrackingWebsocket {
    channel: string;
    event: string;
}

/** Address payload from shipment (may include lat/lng). */
export type TrackingAddress = Record<string, unknown> | null;

export interface OrderTrackingData {
    order_id: number;
    order_status: OrderTrackingStatus;
    captain: OrderTrackingCaptain | null;
    delivery_address: TrackingAddress;
    pickup_address: TrackingAddress;
    branch: { id: number; name: string } | null;
    websocket: OrderTrackingWebsocket;
}

export interface CaptainLocationUpdatedPayload {
    order_id?: number;
    captain_id?: number;
    latitude: number;
    longitude: number;
    heading?: number | null;
    speed?: number | null;
    timestamp?: string | null;
}
