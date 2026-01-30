/**
 * Authentication constants
 */

/**
 * Protected routes that require authentication
 */
export const PROTECTED_ROUTES = [
    '/my-orders',
    '/payment',
    '/profile',
    '/checkout',
    '/my-addresses',
    '/wallet',
    '/wallet/transactions',
    
] as const;

/**
 * Protected API endpoints that require customer authentication
 */
export const PROTECTED_API_ENDPOINTS = [
    '/auth/store/me',
    '/auth/store/logout',
    '/store/orders',
    '/store/wishlist', // All wishlist endpoints require authentication
    '/store/profile',
    '/store/profile/update',
    '/store/cart', // All cart endpoints require authentication
    '/store/cart/merge',
    '/store/addresses', // All address endpoints require authentication
] as const;

/**
 * Session storage keys for auth flow
 */
export const AUTH_STORAGE_KEYS = {
    PHONE: 'auth_phone',
    IS_NEW_USER: 'auth_is_new_user',
    STEP: 'auth_step',
    TEMP_TOKEN: 'auth_temp_token',
    MASKED_PHONE: 'auth_masked_phone',
    OTP_EXPIRES_AT: 'auth_otp_expires_at',
} as const;

/**
 * Cookie names for authentication
 */
export const AUTH_COOKIES = {
    ACCESS_TOKEN: 'accessToken',
    PROFILE_COMPLETE: 'isProfileComplete',
} as const;

/**
 * Cookie expiration (7 days in seconds)
 */
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
