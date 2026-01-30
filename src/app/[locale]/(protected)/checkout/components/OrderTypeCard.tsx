'use client';

import { ChevronLeft, MapPin, Clock } from 'lucide-react';
import CheckoutCard from './CheckoutCard';
import { useState } from 'react';
import { useOrderStore, getScheduledTimeAsDate } from '@/store/useOrderStore';
import { useBranchStore } from '@/store/useBranchStore';
import OrderTypeModal from '@/components/modals/OrderTypeModal';
import { useTranslations } from 'next-intl';
import { getAddressLabel, formatAddressForDisplay } from '@/lib/address';

export default function OrderTypeCard() {
    const t = useTranslations('Order');
    const checkoutT = useTranslations('Checkout');
    const subHeaderT = useTranslations('SubHeader');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {
        orderType,
        deliveryAddress,
        scheduledTime: scheduledTimeRaw,
        orderTime,
    } = useOrderStore();
    const { selectedBranchName } = useBranchStore();

    const scheduledTime = getScheduledTimeAsDate(scheduledTimeRaw);

    const formatScheduledDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatScheduledTime = (date: Date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? 'م' : 'ص';
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const deliveryTypeLabel =
        orderType === 'delivery'
            ? subHeaderT('delivery')
            : orderType === 'pickup'
              ? subHeaderT('pickup')
              : orderType === 'dineIn'
                ? subHeaderT('dineIn')
                : orderType === 'carPickup'
                  ? t('carPickup')
                  : '';

    return (
        <>
            <CheckoutCard
                title={checkoutT('orderTypeAndTime')}
                action={
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-theme-primary/10 px-2.5 py-1.5 rounded-md flex items-center gap-1 text-theme-primary text-md font-medium hover:brightness-[0.95] transition-all">
                        <span>{checkoutT('edit')}</span>
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                }>
                <div className="text-md space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-theme-primary/5 rounded-lg">
                            <MapPin className="w-5 h-5 text-theme-primary" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-sm font-medium">
                                    {orderType === 'delivery'
                                        ? checkoutT('deliveryTo')
                                        : checkoutT('pickupBranch')}
                                </span>
                                <span className="bg-theme-primary/10 text-theme-primary text-xs px-2 py-0.5 rounded-full font-bold">
                                    {deliveryTypeLabel}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 text-gray-800 font-medium leading-relaxed">
                                {orderType === 'delivery' ? (
                                    deliveryAddress ? (
                                        <>
                                            <span className="text-theme-primary font-bold">
                                                (
                                                {getAddressLabel(
                                                    deliveryAddress,
                                                )}
                                                )
                                            </span>
                                            <span>
                                                {formatAddressForDisplay(
                                                    deliveryAddress,
                                                )}
                                            </span>
                                            {(deliveryAddress.notes ||
                                                deliveryAddress.description) && (
                                                <span className="text-gray-500 text-sm font-normal">
                                                    {deliveryAddress.notes ||
                                                        deliveryAddress.description}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-gray-400">
                                            {checkoutT('pleaseSelectAddress')}
                                        </span>
                                    )
                                ) : selectedBranchName ? (
                                    <span>{selectedBranchName}</span>
                                ) : (
                                    <span className="text-gray-400">
                                        {checkoutT('pleaseSelectBranch')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-theme-primary/5 rounded-lg">
                            <Clock className="w-5 h-5 text-theme-primary" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-gray-500 text-sm font-medium">
                                {orderType === 'delivery'
                                    ? checkoutT('deliveryTime')
                                    : checkoutT('pickupTime')}
                            </span>
                            <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                                {orderTime === 'now' ? (
                                    <span className="text-theme-primary">
                                        {checkoutT('now')}
                                    </span>
                                ) : (
                                    <>
                                        <span className="text-theme-primary">
                                            {checkoutT('later')}
                                        </span>
                                        {scheduledTime && (
                                            <>
                                                <span>
                                                    {formatScheduledDate(
                                                        scheduledTime,
                                                    )}
                                                </span>
                                                <span className="text-gray-300">
                                                    |
                                                </span>
                                                <span>
                                                    {formatScheduledTime(
                                                        scheduledTime,
                                                    )}
                                                </span>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CheckoutCard>

            <OrderTypeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
