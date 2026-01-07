import {
    Twitter,
    Facebook,
    Instagram,
    Youtube,
    Ghost,
    Music2,
    Linkedin,
    MessageCircle,
} from 'lucide-react';

export const footerSections = [
    {
        titleKey: 'sections.categories',
        links: [
            { labelKey: 'links.sweets', href: '/' },
            { labelKey: 'links.burger', href: '/' },
            { labelKey: 'links.pizza', href: '/' },
            { labelKey: 'links.meals', href: '/' },
            { labelKey: 'links.drinks', href: '/' },
        ],
    },
    {
        titleKey: 'sections.more',
        links: [
            { labelKey: 'links.myAddresses', href: '/' },
            { labelKey: 'links.wallet', href: '/' },
            { labelKey: 'links.favorites', href: '/' },
            { labelKey: 'links.profile', href: '/' },
        ],
    },
    {
        titleKey: 'sections.about',
        links: [
            { labelKey: 'links.contactUs', href: '/' },
            { labelKey: 'links.faq', href: '/' },
            { labelKey: 'links.terms', href: '/' },
        ],
    },
];

export const appBadges = [
    {
        src: '/images/badges/download-app-store-badge.svg',
        altKey: 'badges.appStore',
        href: '/',
    },
    {
        src: '/images/badges/download-google-play-badge.svg',
        altKey: 'badges.googlePlay',
        href: '/',
    },
    {
        src: '/images/badges/download-huawei-badge.svg',
        altKey: 'badges.appGallery',
        href: '/',
    },
];

export const trustBadges = [
    {
        src: '/images/badges/saudi-business-center-badge.svg',
        altKey: 'badges.saudiBusiness',
    },

    {
        src: '/images/badges/marouf-pay-badge.svg',
        altKey: 'badges.maarof',
    },
];

export const paymentBadges = [
    { src: '/images/badges/tabby-pay-badge.svg', altKey: 'badges.tabby' },
    { src: '/images/badges/tamara-pay-badge.svg', altKey: 'badges.tamara' },
    { src: '/images/badges/stc-pay-badge.svg', altKey: 'badges.stcPay' },
    { src: '/images/badges/e-pay-badge.svg', altKey: 'badges.applePay' },
    { src: '/images/badges/visa-pay-badge.svg', altKey: 'badges.visa' },
    { src: '/images/badges/mada-pay-badge.svg', altKey: 'badges.mada' },
    { src: '/images/badges/master-pay-badge.svg', altKey: 'badges.mastercard' },
];

export const partnerBadges = [
    { src: '/images/badges/driver-pay-badge.svg', altKey: 'badges.driver' },
    { src: '/images/badges/libero-pay-badge.svg', altKey: 'badges.libro' },
    { src: '/images/badges/kareem-pay-badge.svg', altKey: 'badges.careem' },
];

export const socialLinks = [
    { icon: Twitter, href: '/' },
    { icon: Facebook, href: '/' },
    { icon: Instagram, href: '/' },
    { icon: Youtube, href: '/' },
    { icon: Ghost, href: '/' },
    { icon: Music2, href: '/' },
    { icon: Linkedin, href: '/' },
    { icon: MessageCircle, href: '/' },
];
