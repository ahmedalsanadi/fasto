//src/config/site.ts
export const siteConfig = {
    name: 'Fasto',
    description: 'Fasto is a restaurant landing page',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://fasto.vercel.app',
    links: {
        twitter: 'https://twitter.com/s0ver5',
        github: 'https://github.com/s0ver5',
    },
};

export type SiteConfig = typeof siteConfig;
