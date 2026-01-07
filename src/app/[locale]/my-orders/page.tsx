import React from 'react';
import MyOrdersIndex from '@/components/pages/orders/my-orders-index';
import { getOrders } from '@/data/mock';

export default async function MyOrdersPage() {
    // Simulate fetching orders from an API
    const orders = await getOrders();

    return <MyOrdersIndex orders={orders} />;
}
