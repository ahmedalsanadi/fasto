import { orderService } from '@/services/order-service';

export function getOrderTracking(orderId: number | string) {
    return orderService.getOrderTracking(orderId);
}
