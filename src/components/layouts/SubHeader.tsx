//src/components/layouts/SubHeader.tsx
'use client';

import { Building2, ChevronDown, MapPin, Clock, Edit } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useBranchStore } from '@/store/useBranchStore';
import { useOrderStore, getScheduledTimeAsDate } from '@/store/useOrderStore';
import OrderTypeModal from '@/components/modals/OrderTypeModal';
import { getAddressLabel, formatAddressForDisplay } from '@/lib/address';

export default function SubHeader() {
    const t = useTranslations('SubHeader');
    const { selectedBranchName, setModalOpen } = useBranchStore();
    const {
        orderType,
        deliveryAddress,
        scheduledTime: scheduledTimeRaw,
        orderTime,
        setOrderType,
    } = useOrderStore();

    // Convert scheduledTime from string to Date if needed
    const scheduledTime = getScheduledTimeAsDate(scheduledTimeRaw);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    // Use persisted name - no fetch needed! Name is always available immediately
    const branchName = selectedBranchName || t('defaultBranch');

    const handleBranchClick = () => {
        setModalOpen(true);
    };

    const handleOrderTypeClick = (type: string) => {
        if (type === 'delivery') {
            setIsOrderModalOpen(true);
        } else {
            setOrderType(type as 'dineIn' | 'pickup' | 'carPickup');
        }
    };

    const formatScheduledTime = (date: Date) => {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? 'م' : 'ص';
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        return `لاحقاً ${day}/${month}/${year}، ${displayHours}:${minutes
            .toString()
            .padStart(2, '0')} ${period}`;
    };

    const activeOrderType = orderType || 'delivery';

    const orderTypes = [
        { id: 'dineIn', label: t('dineIn') },
        { id: 'pickup', label: t('pickup') },
        { id: 'delivery', label: t('delivery') },
    ];

    const activeStyle =
        'bg-theme-primary/5 text-theme-primary border-theme-primary-border';
    const inactiveStyle = 'bg-gray-50 text-gray-500 hover:border-gray-200';

    return (
        <>
            <div className="mt-4">
                {/* Desktop Layout */}
                <div className="hidden lg:flex bg-white rounded-t-xl h-16 items-center justify-between px-4 shadow-t-sm border-t border-gray-200">
                    {/* Left: Branch and Order Type Label - Always in same position */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBranchClick}
                            className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200 group"
                            aria-label={branchName}>
                            <div className="size-8 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50">
                                <Building2 className="size-4.5 text-gray-500" />
                            </div>
                            <span className="text-gray-900 font-semibold text-sm">
                                {branchName}
                            </span>
                            <ChevronDown className="size-3.5 text-gray-500 group-hover:text-theme-primary transition-colors duration-200" />
                        </button>
                        <span className="text-gray-900 font-medium text-sm whitespace-nowrap">
                            {t('selectOrderType')}
                        </span>
                    </div>

                    {/* Right: Order Type Buttons (when no address) or Order Details (when address saved) */}
                    <div className="flex items-center gap-4">
                        {activeOrderType === 'delivery' && deliveryAddress ? (
                            // Show order details on right when address is saved
                            <>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <MapPin className="w-4 h-4 text-theme-primary" />
                                    <span>
                                        {t('deliveryTo')}{' '}
                                        <span className="font-bold">
                                            ({getAddressLabel(deliveryAddress)})
                                        </span>{' '}
                                        {formatAddressForDisplay(
                                            deliveryAddress,
                                        )}
                                    </span>
                                </div>
                                {orderTime === 'later' && scheduledTime && (
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <Clock className="w-4 h-4 text-theme-primary" />
                                        <span>
                                            {formatScheduledTime(scheduledTime)}
                                        </span>
                                    </div>
                                )}
                                <button
                                    onClick={() => setIsOrderModalOpen(true)}
                                    className="px-3 py-1.5 bg-theme-primary/10 text-theme-primary text-xs font-medium rounded-lg hover:bg-theme-primary/20 transition-colors flex items-center gap-1">
                                    <Edit className="w-3.5 h-3.5" />
                                    {t('edit')}
                                </button>
                            </>
                        ) : (
                            // Show order type selection buttons on right when no address saved
                            <div className="flex items-center gap-2 flex-row-reverse">
                                {orderTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() =>
                                            handleOrderTypeClick(type.id)
                                        }
                                        className={`
                                            h-10 px-4 rounded-md text-sm font-medium 
                                            transition-all duration-200 cursor-pointer border
                                            ${
                                                activeOrderType === type.id
                                                    ? activeStyle
                                                    : inactiveStyle
                                            }
                                        `}
                                        aria-pressed={
                                            activeOrderType === type.id
                                        }>
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="lg:hidden flex flex-col gap-4">
                    <div className="bg-white rounded-xl h-14 flex items-center px-4 shadow-sm border border-gray-200">
                        <button
                            onClick={handleBranchClick}
                            className="flex items-center gap-2 w-full"
                            aria-label={branchName}>
                            <div className="size-8 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 shrink-0">
                                <Building2 className="size-4.5 text-gray-500" />
                            </div>
                            <span className="text-gray-900 font-semibold text-sm truncate">
                                {branchName}
                            </span>
                            <ChevronDown className="size-3.5 text-gray-500 ml-auto" />
                        </button>
                    </div>

                    {/* Order Details on Mobile - Show when address is saved */}
                    {activeOrderType === 'delivery' && deliveryAddress && (
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-2">
                            <div className="flex items-start gap-2 text-sm text-gray-700">
                                <MapPin className="w-4 h-4 text-libero-red shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <span className="font-medium">
                                        {t('deliveryTo')}{' '}
                                        <span className="text-theme-primary font-bold">
                                            ({getAddressLabel(deliveryAddress)})
                                        </span>
                                    </span>
                                    <p className="text-gray-600 text-xs mt-1">
                                        {formatAddressForDisplay(
                                            deliveryAddress,
                                        )}
                                    </p>
                                </div>
                            </div>

                            {orderTime === 'later' && scheduledTime && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <Clock className="w-4 h-4 text-libero-red" />
                                    <span>
                                        {formatScheduledTime(scheduledTime)}
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={() => setIsOrderModalOpen(true)}
                                className="w-full mt-2 px-3 py-2 bg-theme-primary/10 text-theme-primary text-xs font-medium rounded-lg hover:bg-theme-primary/20 transition-colors flex items-center justify-center gap-1">
                                <Edit className="w-3.5 h-3.5" />
                                {t('edit')}
                            </button>
                        </div>
                    )}

                    {/* Order Type Selection Buttons - Show when no address saved */}
                    {(!deliveryAddress || activeOrderType !== 'delivery') && (
                        <div className="w-full bg-white/10 p-1 rounded-xl border border-white/10 backdrop-blur-sm flex items-center flex-row-reverse">
                            {orderTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() =>
                                        handleOrderTypeClick(type.id)
                                    }
                                    className={`
                                        flex-1 h-10 rounded-lg text-xs font-bold 
                                        transition-all duration-200 cursor-pointer 
                                        ${
                                            activeOrderType === type.id
                                                ? 'bg-white text-theme-primary shadow-sm'
                                                : 'text-white/80 hover:bg-white/5'
                                        }
                                    `}
                                    aria-pressed={activeOrderType === type.id}>
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Order Type Modal */}
            <OrderTypeModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
            />
        </>
    );
}
