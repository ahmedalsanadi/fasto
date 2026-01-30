// src/app/[locale]/(protected)/my-addresses/MyAddressesView.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, MapPin, Loader2, Home as HomeIcon } from 'lucide-react';
import AddressCard from './AddressCard';
import AddressModal from '@/components/modals/AddressModal';
import { Button } from '@/components/ui/Button';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { toast } from 'sonner';
import {
    useAddresses,
    useCreateAddress,
    useUpdateAddress,
    useDeleteAddress,
} from '@/hooks/useAddresses';
import { Address } from '@/types/address';
import { useOrderStore } from '@/store/useOrderStore';

export default function MyAddressesView() {
    const t = useTranslations('MyAddresses');

    // React Query Hooks
    const { data: addresses = [], isLoading } = useAddresses();
    const createAddressMutation = useCreateAddress();
    const updateAddressMutation = useUpdateAddress();
    const deleteAddressMutation = useDeleteAddress();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<number | null>(
        null,
    );

    const handleAdd = () => {
        setEditingAddressId(null);
        setIsModalOpen(true);
    };

    const handleEdit = (address: Address) => {
        // We set the ID, and the modal will handle the GET request for accuracy
        setEditingAddressId(address.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm(t('deleteConfirm'))) {
            try {
                const { deliveryAddress, setDeliveryAddress } =
                    useOrderStore.getState();
                await deleteAddressMutation.mutateAsync(id);

                // If we deleted the active address, clear it
                if (deliveryAddress?.id === id) {
                    setDeliveryAddress(null);
                }

                toast.success('Address deleted successfully');
            } catch (error) {
                toast.error('Failed to delete address');
            }
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            const { setDeliveryAddress } = useOrderStore.getState();
            const updated = await updateAddressMutation.mutateAsync({
                id,
                data: { is_default: true },
            });

            // Selecting default address automatically for better UX
            setDeliveryAddress(updated as any);

            toast.success('Default address updated');
        } catch (error) {
            toast.error('Failed to update default address');
        }
    };

    const handleSave = async (addressData: any) => {
        try {
            const { deliveryAddress, setDeliveryAddress } =
                useOrderStore.getState();

            if (editingAddressId) {
                const updated = await updateAddressMutation.mutateAsync({
                    id: editingAddressId,
                    data: addressData,
                });

                // If this was the active delivery address, sync it
                if (deliveryAddress?.id === editingAddressId) {
                    setDeliveryAddress(updated as any);
                }

                toast.success('Address updated successfully');
            } else {
                const created =
                    await createAddressMutation.mutateAsync(addressData);

                // If it's the first address, or market as default, maybe select it
                if (addresses.length === 0 || created.is_default) {
                    setDeliveryAddress(created as any);
                }

                toast.success('Address added successfully');
            }
            setIsModalOpen(false);
            setEditingAddressId(null);
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save address');
        }
    };

    const breadcrumbs = [
        { label: t('home'), href: '/' },
        { label: t('title') },
    ];

    return (
        <div className="mt-4 space-y-6 md:space-y-8">
            <div className="px-1">
                <Breadcrumbs items={breadcrumbs} />
            </div>

            {/* Header */}
            <div className="bg-white rounded-2xl md:rounded-[32px] p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 start-0 w-32 h-32 bg-theme-primary/5 rounded-full -ms-16 -mt-16" />
                <div className="flex flex-col items-center md:items-start text-center md:text-start relative z-10">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-theme-primary/10 flex items-center justify-center mb-4 ring-4 md:ring-8 ring-theme-primary/5">
                        <MapPin className="w-7 h-7 md:w-10 md:h-10 text-theme-primary" />
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold md:font-black text-gray-900">
                        {t('title')}
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base font-medium mt-1 md:mt-2 max-w-sm">
                        {t('subtitle')}
                    </p>
                </div>

                <Button
                    onClick={handleAdd}
                    className="w-full md:w-auto h-11 md:h-14 px-8 md:px-10 rounded-xl md:rounded-2xl bg-theme-primary hover:brightness-95 text-white font-bold text-sm md:text-lg shadow-lg shadow-theme-primary/10 transition-all active:scale-95 relative z-10 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    {t('addNew')}
                </Button>
            </div>

            {/* Content */}
            <div className="bg-gray-50/50 rounded-2xl md:rounded-[40px] p-4 md:p-10 lg:p-12 border border-blue-50/50 min-h-[400px] flex flex-col items-center justify-center">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-theme-primary animate-spin" />
                        <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">
                            Syncing with Cloud...
                        </span>
                    </div>
                ) : addresses.length > 0 ? (
                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        {addresses.map((address) => (
                            <AddressCard
                                key={address.id}
                                address={address}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onSetDefault={handleSetDefault}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-6">
                            <HomeIcon className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {t('noAddresses')}
                        </h3>
                        <p className="text-gray-500 max-w-xs mb-8">
                            Add your first address to enjoy faster checkout and
                            delivery.
                        </p>
                        <Button
                            variant="outline"
                            onClick={handleAdd}
                            className="rounded-xl px-8">
                            {t('addNew')}
                        </Button>
                    </div>
                )}
            </div>

            <AddressModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingAddressId(null);
                }}
                onSave={handleSave}
                addressId={editingAddressId}
            />
        </div>
    );
}
