export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface StoreTheme {
    primary_color: string;
    secondary_color: string;
    logo_url: string;
}

export interface AppVersion {
    current: string;
    minimum: string;
    force_update: boolean;
    update_message: string;
}

export interface SocialChannel {
    icon: string;
    link: string;
    type: string;
    title: string;
    status: boolean;
}

export interface StoreInfo {
    name: string;
    slogan: string;
    logo_url: string;
    default_language: string;
    default_currency: string;
    support_channels: Record<string, unknown> | null;
    social_channels: SocialChannel[];
    products_type: string;
    store_type: string;
}

export interface StoreFeatures {
    cart: boolean;
    wishlist: boolean;
    reviews: boolean;
    coupons: boolean;
    loyalty_points: boolean;
    guest_checkout: boolean;
}

export interface HomeSections {
    banners: unknown[];
    show_categories: boolean;
    show_featured_products: boolean;
    show_offers: boolean;
    show_new_arrivals: boolean;
    sections_order: string[];
}

export interface CheckoutSettings {
    min_order_amount: number;
    delivery_fee: number;
    free_delivery_threshold: number;
    tax_rate: number;
    tax_included: boolean;
    allow_order_notes: boolean;
    allow_scheduled_orders: boolean;
}

export interface Category {
    id: number | string;
    title: string;
    slug: string;
    image_url?: string;
    children?: Category[];
    parent_id?: number | string | null;
}

export interface StoreConfig {
    theme: StoreTheme;
    app_version: AppVersion;
    store: StoreInfo;
    features: StoreFeatures;
    home_sections: HomeSections;
    checkout: CheckoutSettings;
}

export interface Product {
    id: number | string;
    title: string;
    price: string | number;
    sale_price: string | number | null;
    cover_image_url: string;
    is_available: boolean;
    type: string;
    categoryId?: string | number;
    subCategoryId?: string | number;
    description?: string;
}
