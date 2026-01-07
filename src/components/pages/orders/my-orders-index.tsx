import React from 'react';
import { getTranslations } from 'next-intl/server';
import OrderCard from './order-card';
import SubHeaderManager from '@/components/layouts/sub-header-manager';
import { Order } from '@/data/mock';

interface MyOrdersIndexProps {
    orders: Order[];
}

export default async function MyOrdersIndex({ orders }: MyOrdersIndexProps) {
    const t = await getTranslations('Orders');
    return (
        <section className="min-h-screen pb-16 pt-6 px-2 md:px-4">
            {/* Manage SubHeader (Client Logic) */}
            <SubHeaderManager show={false} />

            {/*Title Section */}
            <div className="flex items-center justify-start my-4 md:my-12">
                <h1 className="text-2xl font-black text-gray-900 border-s-4 border-[#B44B3A] ps-4">
                    {t('title')}
                </h1>
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                {orders.map((order) => (
                    <div key={order.id} className="h-full">
                        <OrderCard order={order} />
                    </div>
                ))}
            </div>
        </section>
    );
}
