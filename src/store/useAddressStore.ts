// src/store/useAddressStore.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Address } from '@/types/address';

interface AddressState {
    addresses: Address[];
    addAddress: (address: Address) => void;
    updateAddress: (address: Address) => void;
    deleteAddress: (id: number) => void;
    setDefaultAddress: (id: number) => void;
    clearAddresses: () => void;
}

const ADDRESS_STORAGE_VERSION = 1;

export const useAddressStore = create<AddressState>()(
    persist(
        (set) => ({
            addresses: [],
            addAddress: (address) =>
                set((state) => {
                    // For guests, we only allow one address.
                    // If one exists, replace it. Otherwise add.
                    const newAddress = { ...address, is_default: true };
                    return { addresses: [newAddress] };
                }),
            updateAddress: (updatedAddress) =>
                set((state) => {
                    // For guests, since there's only one, we just replace it.
                    const newAddress = { ...updatedAddress, is_default: true };
                    return { addresses: [newAddress] };
                }),
            deleteAddress: (id) => set(() => ({ addresses: [] })), // Deleting the only one clears the list
            setDefaultAddress: (id) =>
                set((state) => ({
                    addresses: state.addresses.map((addr) => ({
                        ...addr,
                        is_default: addr.id === id,
                    })),
                })),
            clearAddresses: () => set({ addresses: [] }),
        }),
        {
            name: 'addresses-storage',
            version: ADDRESS_STORAGE_VERSION,
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
