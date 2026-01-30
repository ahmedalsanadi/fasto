// src/components/modals/OrderTypeModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Clock, Plus, Edit, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
    useOrderStore,
    OrderType,
    OrderTime,
    getScheduledTimeAsDate,
} from '@/store/useOrderStore';
import { useAddressStore } from '@/store/useAddressStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Address } from '@/types/address';
import AddressModal from './AddressModal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    useAddresses,
    useCreateAddress,
    useUpdateAddress,
} from '@/hooks/useAddresses';
import {
    type AddressFormSubmitPayload,
    toCreateAddressRequest,
    toUpdateAddressRequest,
} from '@/types/address';
import {
    getNextDeliveryAddressAfterMutation,
    showAddNewAddressButton,
    getAddressLabel,
    formatAddressForDisplay,
} from '@/lib/address';

interface OrderTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OrderTypeModal: React.FC<OrderTypeModalProps> = ({ isOpen, onClose }) => {
    const t = useTranslations('Order');
    const {
        orderType,
        deliveryAddress,
        scheduledTime: scheduledTimeRaw,
        orderTime,
        setOrderType,
        setDeliveryAddress,
        setScheduledTime,
        setOrderTime,
    } = useOrderStore();

    const { isAuthenticated } = useAuthStore();
    const { addresses: guestAddresses, addAddress: addGuestAddress } =
        useAddressStore();

    // React Query for authenticated user addresses
    const { data: apiAddresses = [], isLoading: isLoadingApiAddresses } =
        useAddresses();
    const createAddressMutation = useCreateAddress();
    const updateAddressMutation = useUpdateAddress();

    // Determine which addresses to show
    const displayAddresses = isAuthenticated ? apiAddresses : guestAddresses;
    const isLoadingAddresses = isAuthenticated ? isLoadingApiAddresses : false;

    const scheduledTime = getScheduledTimeAsDate(scheduledTimeRaw);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<number | null>(
        null,
    );
    const [editingGuestAddress, setEditingGuestAddress] =
        useState<Address | null>(null);

    const [showDateTimePicker, setShowDateTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState('');
    const [tempTime, setTempTime] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    // Default address selection if none active
    useEffect(() => {
        if (
            isOpen &&
            orderType === 'delivery' &&
            !deliveryAddress &&
            displayAddresses.length > 0
        ) {
            const defaultAddr =
                displayAddresses.find((a) => a.is_default) ||
                displayAddresses[0];
            setDeliveryAddress(defaultAddr);
        }
    }, [
        isOpen,
        orderType,
        deliveryAddress,
        displayAddresses,
        setDeliveryAddress,
    ]);

    const showAddNew = showAddNewAddressButton(
        isAuthenticated,
        displayAddresses.length,
    );

    const handleAddAddress = () => {
        setEditingAddressId(null);
        setEditingGuestAddress(null);
        setShowAddressModal(true);
    };

    const handleEditAddress = (address: Address) => {
        if (isAuthenticated) {
            setEditingAddressId(address.id);
        } else {
            setEditingGuestAddress(address);
        }
        setShowAddressModal(true);
    };

    const handleAddressSave = async (addressData: AddressFormSubmitPayload) => {
        try {
            if (isAuthenticated) {
                if (editingAddressId) {
                    const result = await updateAddressMutation.mutateAsync({
                        id: editingAddressId,
                        data: toUpdateAddressRequest(addressData),
                    });
                    const next = getNextDeliveryAddressAfterMutation({
                        event: 'updated',
                        address: result,
                        currentDelivery: deliveryAddress,
                    });
                    setDeliveryAddress(next);
                    toast.success(t('addressSaved'));
                } else {
                    const result = await createAddressMutation.mutateAsync(
                        toCreateAddressRequest(addressData),
                    );
                    const next = getNextDeliveryAddressAfterMutation({
                        event: 'created',
                        address: result,
                        currentDelivery: deliveryAddress,
                        addressesCountBeforeCreate: apiAddresses.length,
                    });
                    setDeliveryAddress(next);
                    toast.success(t('addressSaved'));
                }
            } else {
                const guestAddr = {
                    ...addressData,
                    id: Date.now(),
                } as Address;
                addGuestAddress(guestAddr);
                setDeliveryAddress(guestAddr);
                toast.success(t('addressSaved'));
            }
            setShowAddressModal(false);
            setEditingAddressId(null);
            setEditingGuestAddress(null);
        } catch (error) {
            console.error('Failed to save address:', error);
            toast.error(t('addressSaveError'));
        }
    };

    const handleTimeSelect = (time: OrderTime) => {
        setOrderTime(time);
        if (time === 'now') {
            setScheduledTime(null);
            setShowDateTimePicker(false);
        } else {
            openDateTimePicker();
        }
    };

    const openDateTimePicker = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const date = scheduledTime || tomorrow;
        setTempDate(date.toISOString().split('T')[0]);
        setTempTime(
            `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
        );
        setShowDateTimePicker(true);
    };

    if (!isOpen) return null;

    const orderTypes: Array<{ id: OrderType; label: string }> = [
        { id: 'delivery', label: t('delivery') },
        { id: 'dineIn', label: t('dineIn') },
        { id: 'pickup', label: t('pickup') },
        { id: 'carPickup', label: t('carPickup') },
    ];

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={modalRef}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true">
                <div
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">
                            {t('orderType')}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Order Type */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {t('selectOrderType')}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {orderTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setOrderType(type.id)}
                                        className={cn(
                                            'p-4 rounded-xl border-2 transition-all duration-200 text-right',
                                            orderType === type.id
                                                ? 'bg-theme-primary/5 border-theme-primary text-theme-primary font-semibold'
                                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300',
                                        )}>
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Addresses */}
                        {orderType === 'delivery' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {t('deliveryAddress')}
                                    </h3>
                                    {showAddNew && (
                                        <button
                                            onClick={handleAddAddress}
                                            className="text-theme-primary text-sm font-bold flex items-center gap-1 hover:underline">
                                            <Plus className="w-4 h-4" />
                                            {t('addNew')}
                                        </button>
                                    )}
                                </div>

                                {isLoadingAddresses ? (
                                    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-100">
                                        <Loader2 className="w-6 h-6 text-theme-primary animate-spin" />
                                    </div>
                                ) : displayAddresses.length > 0 ? (
                                    <div className="space-y-3">
                                        {displayAddresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                onClick={() =>
                                                    setDeliveryAddress(addr)
                                                }
                                                className={cn(
                                                    'p-4 rounded-xl border-2 transition-all cursor-pointer group relative',
                                                    deliveryAddress?.id ===
                                                        addr.id
                                                        ? 'bg-theme-primary/5 border-theme-primary'
                                                        : 'bg-white border-gray-100 hover:border-gray-200',
                                                )}>
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={cn(
                                                            'w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0',
                                                            deliveryAddress?.id ===
                                                                addr.id
                                                                ? 'border-theme-primary bg-theme-primary'
                                                                : 'border-gray-300',
                                                        )}>
                                                        {deliveryAddress?.id ===
                                                            addr.id && (
                                                            <div className="w-2 h-2 bg-white rounded-full" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-gray-900">
                                                                {getAddressLabel(
                                                                    addr,
                                                                )}
                                                            </span>
                                                            {addr.is_default && (
                                                                <span className="text-[10px] bg-theme-primary/10 text-theme-primary px-2 py-0.5 rounded-full font-bold">
                                                                    {t(
                                                                        'default',
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 line-clamp-1">
                                                            {formatAddressForDisplay(
                                                                addr,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditAddress(
                                                                addr,
                                                            );
                                                        }}
                                                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all">
                                                        <Edit className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleAddAddress}
                                        className="w-full p-8 border-2 border-dashed border-gray-200 rounded-2xl hover:border-theme-primary hover:bg-theme-primary/5 transition-all group">
                                        <div className="flex flex-col items-center gap-2">
                                            <Plus className="w-6 h-6 text-gray-400 group-hover:text-theme-primary" />
                                            <span className="font-bold text-gray-500 group-hover:text-theme-primary">
                                                {t('addAddress')}
                                            </span>
                                        </div>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Order Time */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {t('selectOrderTime')}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleTimeSelect('now')}
                                    className={cn(
                                        'p-4 rounded-xl border-2 transition-all duration-200 text-right',
                                        orderTime === 'now'
                                            ? 'bg-theme-primary/5 border-theme-primary text-theme-primary font-semibold'
                                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300',
                                    )}>
                                    {t('now')}
                                </button>
                                <button
                                    onClick={() => handleTimeSelect('later')}
                                    className={cn(
                                        'p-4 rounded-xl border-2 transition-all duration-200 text-right',
                                        orderTime === 'later'
                                            ? 'bg-theme-primary/5 border-theme-primary text-theme-primary font-semibold'
                                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300',
                                    )}>
                                    {t('later')}
                                </button>
                            </div>

                            {/* Date/Time Picker UI */}
                            {orderTime === 'later' && showDateTimePicker && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider pr-1">
                                                {t('date')}
                                            </label>
                                            <input
                                                type="date"
                                                value={tempDate}
                                                min={
                                                    new Date()
                                                        .toISOString()
                                                        .split('T')[0]
                                                }
                                                onChange={(e) =>
                                                    setTempDate(e.target.value)
                                                }
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-theme-primary outline-none font-bold text-gray-900 bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider pr-1">
                                                {t('time')}
                                            </label>
                                            <input
                                                type="time"
                                                value={tempTime}
                                                onChange={(e) =>
                                                    setTempTime(e.target.value)
                                                }
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-theme-primary outline-none font-bold text-gray-900 bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                if (tempDate && tempTime) {
                                                    const newDate = new Date(
                                                        `${tempDate}T${tempTime}`,
                                                    );
                                                    setScheduledTime(newDate);
                                                    setShowDateTimePicker(
                                                        false,
                                                    );
                                                    toast.success(
                                                        t('timeUpdated'),
                                                    );
                                                }
                                            }}
                                            className="flex-1 bg-theme-primary text-white font-bold py-2.5 rounded-xl hover:brightness-95 transition-all shadow-md shadow-theme-primary/10">
                                            {t('confirmTime')}
                                        </button>
                                        <button
                                            onClick={() =>
                                                setShowDateTimePicker(false)
                                            }
                                            className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-all">
                                            {t('cancel')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {orderTime === 'later' &&
                                scheduledTime &&
                                !showDateTimePicker && (
                                    <div className="mt-4 p-4 bg-theme-primary/5 rounded-2xl border border-theme-primary/10 flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-theme-primary/10 flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-theme-primary" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-theme-primary/50 tracking-widest">
                                                    {t('scheduledFor')}
                                                </p>
                                                <p className="font-bold text-gray-900">
                                                    {scheduledTime.toLocaleDateString()}{' '}
                                                    @ {tempTime}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                setShowDateTimePicker(true)
                                            }
                                            className="p-2 hover:bg-theme-primary/10 rounded-lg text-theme-primary transition-all">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 flex items-center justify-end">
                        <button
                            onClick={onClose}
                            className="w-full bg-theme-primary text-white font-semibold py-3 rounded-xl hover:brightness-[0.95] transition-all">
                            {t('save')}
                        </button>
                    </div>
                </div>
            </div>

            <AddressModal
                isOpen={showAddressModal}
                onClose={() => {
                    setShowAddressModal(false);
                    setEditingAddressId(null);
                    setEditingGuestAddress(null);
                }}
                onSave={handleAddressSave}
                initialAddress={editingGuestAddress}
                addressId={editingAddressId}
            />
        </>
    );
};

export default OrderTypeModal;
