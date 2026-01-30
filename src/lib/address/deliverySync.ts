/**
 * Centralized logic for updating the active delivery address after address mutations.
 * Use this so MyAddressesView and OrderTypeModal stay in sync with useOrderStore.deliveryAddress
 * without duplicating conditions.
 */
import type { Address } from '@/types/address';
import type { DeliveryAddress } from '@/store/useOrderStore';

export type DeliveryAddressMutationEvent =
    | 'created'
    | 'updated'
    | 'deleted'
    | 'set_default';

export interface GetNextDeliveryAddressOptions {
    event: DeliveryAddressMutationEvent;
    /** The address returned from create/update/set_default. Not used for 'deleted'. */
    address?: Address | null;
    /** The id of the address that was deleted. Only used for 'deleted'. */
    addressId?: number;
    /** Current delivery address from useOrderStore. */
    currentDelivery: DeliveryAddress | null;
    /** Number of addresses before a create (0 = first address). Used for 'created' to auto-select first. */
    addressesCountBeforeCreate?: number;
}

/**
 * Returns the value to set for deliveryAddress after a mutation.
 * Caller should always call setDeliveryAddress(result).
 * For 'deleted' + matching id → null; for 'updated'/'set_default' + matching id → new address;
 * for 'created' + (first or is_default) → new address; otherwise returns currentDelivery unchanged.
 */
export function getNextDeliveryAddressAfterMutation(
    options: GetNextDeliveryAddressOptions,
): DeliveryAddress | null {
    const {
        event,
        address,
        addressId,
        currentDelivery,
        addressesCountBeforeCreate = 0,
    } = options;

    switch (event) {
        case 'deleted':
            if (currentDelivery?.id === addressId) return null;
            return currentDelivery;

        case 'updated':
        case 'set_default':
            if (address && currentDelivery?.id === address.id) return address;
            return currentDelivery;

        case 'created':
            if (
                address &&
                (addressesCountBeforeCreate === 0 || address.is_default)
            ) {
                return address;
            }
            return currentDelivery;

        default:
            return currentDelivery;
    }
}
