import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'store-api.libro-shop.com',
            },
            {
                protocol: 'https',
                hostname: 'dashboard.libro-shop.com',
            },
        ],
    },
};

export default withNextIntl(nextConfig);
