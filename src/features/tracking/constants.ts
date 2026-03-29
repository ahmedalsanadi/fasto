/** API: Libero order status "shipped" / out for delivery. */
export const ORDER_STATUS_SHIPPED_VALUE = 6;

export const TRACKING_QUERY_KEY_PREFIX = 'tracking' as const;

/** Initial REST payload freshness (prompt: 30s). */
export const TRACKING_STALE_TIME_MS = 30_000;

/** Polling when WebSocket is unavailable (prompt: 10s). */
export const TRACKING_POLL_INTERVAL_MS = 10_000;

/** Mark WS as failed if not connected after this (ms). */
export const TRACKING_WS_CONNECT_TIMEOUT_MS = 12_000;

export const TRACKING_WS_EVENT_DEFAULT = 'captain.location.updated' as const;
