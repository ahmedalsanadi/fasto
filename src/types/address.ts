// src/types/address.ts
export interface Country {
    id: number;
    name: string;
}

export interface City {
    id: number;
    name: string;
}

export interface District {
    id: number;
    name: string;
}

export interface Address {
    id: number;
    label: string;
    recipient_name: string;
    phone: string;
    country_id: number;
    city_id: number;
    district_id: number | null;
    street: string;
    building?: string | null;
    building_number?: string | null;
    unit?: string | null;
    unit_number?: string | null;
    postal_code?: string | null;
    additional_number?: string | null;
    description?: string | null;
    notes?: string | null;
    is_default: boolean;
    // For convenience in UI
    country_name?: string;
    city_name?: string;
    district_name?: string;
    // Seen in some API responses
    country?: string;
    city?: string;
    district?: string;
    formatted?: string;
    latitude?: number;
    longitude?: number;
    name?: string;
    isDefault?: boolean;
}

export interface CreateAddressRequest {
    label: string;
    recipient_name?: string;
    phone: string;
    country_id: number;
    city_id: number;
    district_id?: number;
    street: string;
    building?: string;
    unit?: string;
    postal_code?: string;
    additional_number?: string;
    description?: string;
    is_default?: boolean;
    latitude?: number;
    longitude?: number;
}

export type UpdateAddressRequest = Partial<CreateAddressRequest>;

/**
 * Payload emitted by AddressModal onSave. Matches CreateAddressRequest plus id (for edit)
 * and optional display fields (name, formatted, notes) used by guest/local state.
 * district_id can be null when no district is selected.
 */
export interface AddressFormSubmitPayload extends Omit<
    CreateAddressRequest,
    'district_id'
> {
    district_id?: number | null;
    id?: number;
    name?: string;
    formatted?: string;
    notes?: string;
}

/** Convert form payload to API create request (omit display-only fields, normalize district_id). */
export function toCreateAddressRequest(
    payload: AddressFormSubmitPayload,
): CreateAddressRequest {
    const { id, name, formatted, notes, district_id, ...rest } = payload;
    return {
        ...rest,
        district_id: district_id ?? undefined,
    };
}

/** Convert form payload to API update request (omit display-only fields, normalize district_id). */
export function toUpdateAddressRequest(
    payload: AddressFormSubmitPayload,
): UpdateAddressRequest {
    const { id, name, formatted, notes, district_id, ...rest } = payload;
    return {
        ...rest,
        district_id: district_id ?? undefined,
    };
}
