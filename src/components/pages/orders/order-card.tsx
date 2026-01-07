'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Star, Store, Calendar, MapPin, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CurrencySymbol from '@/components/ui/currency-symbol';
import { cn } from '@/lib/utils';

import { Order } from '@/data/mock';

interface OrderCardProps {
    order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
    const t = useTranslations('Orders');

    const statusConfig = {
        delivered: {
            bg: 'bg-[#E8F5E9]',
            text: 'text-[#2E7D32]',
            label: t('status.delivered'),
        },
        waiting: {
            bg: 'bg-[#FFF8E1]',
            text: 'text-[#FBC02D]',
            label: t('status.waiting'),
        },
    };

    const currentStatus = statusConfig[order.status];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-5 shadow-sm hover:shadow-md transition-all duration-300 ">
            {/* Header: Status, Rating and Order Number */}
            <div className="flex items-center justify-between gap-4 pt-2 pb-4 border-b border-gray-200">
                <h3 className="text-lg md:text-2xl font-black text-gray-900 truncate">
                    {t('orderNumber', { number: order.orderNumber })}
                </h3>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-[#F1F3F5] px-2.5 py-1.5 rounded-lg shrink-0">
                        <span className="text-sm font-bold text-gray-700 leading-none">
                            {order.rating.toFixed(1)}
                        </span>
                        <Star className="w-3.5 h-3.5 fill-[#FBC02D] text-[#FBC02D]" />
                    </div>

                    <Badge
                        className={cn(
                            'px-4 py-1.5 rounded-lg border-none font-bold text-sm whitespace-nowrap',
                            currentStatus.bg,
                            currentStatus.text,
                        )}
                    >
                        {currentStatus.label}
                    </Badge>
                </div>
            </div>

            {/* Order Details List */}
            <div className="flex flex-col gap-3">
                {/* Branch */}
                <div className="flex items-center gap-3 text-gray-500">
                    <Store className="w-5 h-5 opacity-60" />
                    <span className="text-sm font-medium">
                        {t('branch', { name: order.branchName })}
                    </span>
                </div>

                {/* Created At */}
                <div className="flex items-center gap-3 text-gray-500">
                    <Calendar className="w-5 h-5 opacity-60" />

                    <span className="text-sm font-medium" dir="rtl">
                        {t('createdAt', {
                            date: '22/11/2025',
                            time: '10:00 م',
                        })}
                    </span>
                </div>

                {/* Delivery Location */}
                <div className="flex items-center gap-3 text-gray-500">
                    <MapPin className="w-5 h-5 opacity-60" />

                    <div className="flex flex-col">
                        <span className="text-[11px] opacity-70 leading-tight">
                            حي اليرموك، شارع النجاح، منزل رقم 42، الرياض 13243
                        </span>
                        <span className="text-sm font-medium">
                            {t('deliveryTo', {
                                location: order.deliveryLocation,
                            })}
                        </span>
                    </div>
                </div>

                {/* Total */}
                <div className="flex items-center gap-3 text-gray-900">
                    <Banknote className="w-5 h-5 opacity-60" />

                    <div className="flex items-center gap-1">
                        <span className="text-lg font-black tracking-tight">
                            {order.totalAmount.toFixed(2)}
                        </span>
                        <CurrencySymbol className="w-4 h-4 me-1" />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-auto">
                {order.status === 'delivered' ? (
                    <>
                        <Button
                            variant="secondary"
                            className="flex-1 bg-[#F1F3F5] text-gray-600 hover:bg-gray-200 border-none font-bold h-11 rounded-xl"
                        >
                            {t('details')}
                        </Button>
                        <Button className="flex-1 bg-[#B44B3A] hover:bg-[#A04234] text-white border-none font-bold h-11 rounded-xl shadow-lg shadow-[#B44B3A]/20">
                            {t('reorder')}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="secondary"
                            className="flex-1 bg-[#F1F3F5] text-gray-600 hover:bg-gray-200 border-none font-bold h-11 rounded-xl"
                        >
                            {t('reportProblem')}
                        </Button>
                        <Button className="flex-1 bg-[#FDE8E4] text-[#B44B3A] hover:bg-[#FCD8D2] border-none font-bold h-11 rounded-xl">
                            {t('details')}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
