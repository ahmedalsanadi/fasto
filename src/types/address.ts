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
