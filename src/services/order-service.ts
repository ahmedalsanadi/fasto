// src/services/order-service.ts
import { fetchLibero, fetchLiberoFull } from '@/lib/api';
import {
    Order,
    CreateOrderRequest,
    CreateOrderResponse,
    CheckoutInitRequest,
    CheckoutInitResponse,
    PaymentStatusResponse,
} from '@/types/orders/orders.types';
import type { OrderTrackingData } from '@/types/orders/tracking.types';

export const orderService = {
    /**
     * List customer orders.
     */
    getOrders: (params?: { page?: number; per_page?: number }) =>
        fetchLiberoFull<Order[]>('/store/orders', {
            params,
            isProtected: true,
        }),

    /**
     * Get order details.
     */
    getOrder: (id: number | string) =>
        fetchLibero<Order>(`/store/orders/${id}`, {
            isProtected: true,
        }),

    /**
     * Live tracking payload (captain location, addresses, WebSocket channel metadata).
     */
    getOrderTracking: (id: number | string) =>
        fetchLibero<OrderTrackingData>(`/store/orders/${id}/tracking`, {
            isProtected: true,
        }),

    /**
     * Initialize checkout: validates cart and returns payment methods, wallet, summary, etc.
     * Call on checkout page load and when fulfillment method or address changes.
     */
    checkoutInit: (data: CheckoutInitRequest) =>
        fetchLibero<CheckoutInitResponse>('/store/orders/init', {
            method: 'POST',
            body: JSON.stringify(data),
            isProtected: true,
        }),

    /**
     * Create a new order (checkout).
     */
    createOrder: (data: CreateOrderRequest) =>
        fetchLibero<CreateOrderResponse>('/store/orders', {
            method: 'POST',
            body: JSON.stringify(data),
            isProtected: true,
        }),

    /**
     * Cancel an order.
     */
    cancelOrder: (id: number | string) =>
        fetchLibero<{
            id: number;
            status: string;
            status_label: string;
            cancelled_at: string;
        }>(`/store/orders/${id}/cancel`, {
            method: 'POST',
            isProtected: true,
        }),

    /**
     * Get payment status after return from gateway (epayment).
     * Status: 1=initiated, 2=pending, 3=failed, 4=paid, 5=cancelled, 6=expired.
     */
    getPaymentStatus: (attemptId: number | string) =>
        fetchLibero<PaymentStatusResponse>(
            `/store/orders/payment-status/${attemptId}`,
            { isProtected: true },
        ),
};
