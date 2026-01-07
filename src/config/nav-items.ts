export interface NavItemType {
    id: string;
    label: string;
    href: string;
    icon: string;
    alt?: string;
}

export const NAV_ITEMS: NavItemType[] = [
    {
        id: 'home',
        label: 'الرئيسية',
        href: '/',
        icon: '/images/svgs/home-icon.svg',
        alt: 'Home',
    },
    {
        id: 'categories',
        label: 'الأقسام',
        href: '/products',
        icon: '/images/svgs/4grid-squares-icon.svg',
        alt: 'Categories',
    },
    {
        id: 'branches',
        label: 'الفروع',
        href: '/branches',
        icon: '/images/svgs/building-icon.svg',
        alt: 'Branches',
    },
    {
        id: 'offers',
        label: 'العروض',
        href: '/offers',
        icon: '/images/svgs/divide-sign-icon.svg',
        alt: 'Offers',
    },
    {
        id: 'my-orders',
        label: 'طلباتي',
        href: '/my-orders',
        icon: '/images/svgs/shopping-bag-icon.svg',
        alt: 'My Orders',
    },
];
