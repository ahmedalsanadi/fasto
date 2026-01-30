/**
 * Hook for merging guest address with customer account after authentication
 */

import { useCallback } from 'react';
import { useAddressStore } from '@/store/useAddressStore';
import { storeService } from '@/services/store-service';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export function useAddressMerge() {
    const { addresses, clearAddresses } = useAddressStore();
    const { isAuthenticated } = useAuthStore();

    const mergeGuestAddressAfterAuth = useCallback(async () => {
        if (!isAuthenticated || addresses.length === 0) return;

        try {
            console.log(
                '[useAddressMerge] Syncing guest addresses to account...',
            );

            // We only care about the most relevant address for now, or all of them.
            // The user said "if he is not auth then he can only store one address"
            // but the store currently supports multiple. Let's sync all.

            const syncPromises = addresses.map(async (addr) => {
                const payload = {
                    label: addr.label || addr.name || 'Home',
                    recipient_name: addr.recipient_name || '',
                    phone: addr.phone || '',
                    country_id: addr.country_id || 1, // Default to SA if missing
                    city_id: addr.city_id,
                    district_id: addr.district_id ?? undefined,
                    street: addr.street || addr.formatted || '',
                    building: addr.building || undefined,
                    unit: addr.unit || undefined,
                    postal_code: addr.postal_code || undefined,
                    additional_number: addr.additional_number || undefined,
                    description: addr.description || addr.notes || '',
                    is_default: addr.is_default || false,
                    latitude: addr.latitude ? Number(addr.latitude) : undefined,
                    longitude: addr.longitude
                        ? Number(addr.longitude)
                        : undefined,
                };
                return storeService.createAddress(payload);
            });

            await Promise.all(syncPromises);

            // Clear local storage after successful sync
            clearAddresses();
            console.log(
                '[useAddressMerge] Guest addresses synced and cleared from local storage.',
            );
        } catch (error) {
            console.error(
                '[useAddressMerge] Failed to sync guest addresses:',
                error,
            );
            // We don't toast error here to not interrupt login flow,
            // but we keep the addresses in local storage for next attempt.
        }
    }, [isAuthenticated, addresses, clearAddresses]);

    return { mergeGuestAddressAfterAuth };
}
