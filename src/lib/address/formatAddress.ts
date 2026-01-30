/**
 * Shared address display formatting and delivery UI helpers.
 * Use for SubHeader, OrderTypeCard, AddressCard so label + street/building/unit/city
 * stay consistent and maintainable.
 */
import type { Address } from '@/types/address';

/**
 * Whether to show the "Add New" address button in delivery address UI.
 * Guests: show only when they have no address yet (max one). Auth: always show.
 */
export function showAddNewAddressButton(
    isAuthenticated: boolean,
    addressCount: number,
): boolean {
    if (isAuthenticated) return true;
    return addressCount === 0;
}

/** Default label when address has no label/name. */
export const DEFAULT_ADDRESS_LABEL = 'Address';

/**
 * Returns the display label for an address (label, name, or fallback).
 */
export function getAddressLabel(address: Address | null | undefined): string {
    if (!address) return DEFAULT_ADDRESS_LABEL;
    return address.label || address.name || DEFAULT_ADDRESS_LABEL;
}

/**
 * Returns a single-line formatted string for the address (street, building, unit, city).
 * Prefers address.formatted when present.
 */
export function formatAddressForDisplay(
    address: Address | null | undefined,
): string {
    if (!address) return '';

    if (address.formatted && address.formatted.trim()) {
        return address.formatted.trim();
    }

    const parts: string[] = [address.street || ''];

    const building = address.building ?? address.building_number ?? null;
    if (building) parts.push(building);

    const unit = address.unit ?? address.unit_number ?? null;
    if (unit) parts.push(unit);

    const city = address.city_name ?? address.city ?? '';
    if (city) parts.push(city);

    return parts.filter(Boolean).join(', ');
}
