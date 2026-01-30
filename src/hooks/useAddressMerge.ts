/**
 * Hook for merging guest address with customer account after authentication
 */
import { useCallback } from 'react';
import { useAddressStore } from '@/store/useAddressStore';
import { storeService } from '@/services/store-service';
import { useAuthStore } from '@/store/useAuthStore';

export function useAddressMerge() {
    const { addresses, clearAddresses } = useAddressStore();
    const { isAuthenticated } = useAuthStore();

    const mergeGuestAddressAfterAuth = useCallback(async () => {
        // Only proceed if authenticated and we actually have guest addresses to sync
        if (!isAuthenticated || addresses.length === 0) {
            return;
        }

        try {
            if (process.env.NODE_ENV === 'development') {
                console.log(
                    `[useAddressMerge] Syncing ${addresses.length} guest address(es) to account...`,
                );
            }

            // Map all guest addresses to creation promises
            const syncPromises = addresses.map(async (addr) => {
                const payload = {
                    label: addr.label || addr.name || 'Home',
                    recipient_name: addr.recipient_name || '',
                    phone: addr.phone || '',
                    country_id: addr.country_id || 1,
                    city_id: addr.city_id,
                    district_id: addr.district_id ?? undefined,
                    street: addr.street || addr.formatted || '',
                    building:
                        addr.building || addr.building_number || undefined,
                    unit: addr.unit || addr.unit_number || undefined,
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

            // Execute all syncs
            await Promise.all(syncPromises);

            // Successfully merged! Clear local storage.
            clearAddresses();
            if (process.env.NODE_ENV === 'development') {
                console.log(
                    '[useAddressMerge] Guest addresses successfully merged and cleared.',
                );
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error(
                    '[useAddressMerge] Failed to sync guest addresses:',
                    error,
                );
            }
            // We keep the addresses in local storage so we can try again on next mount or action
        }
    }, [isAuthenticated, addresses, clearAddresses]);

    return { mergeGuestAddressAfterAuth };
}
