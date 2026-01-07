'use client';
import { usePathname } from '@/i18n/navigation';
import { Search, Menu } from 'lucide-react';
import { NAV_ITEMS } from '@/config/nav-items';
import Logo from './logo';
import NavItem from './nav-item';
import { Input } from '@/components/ui/input';

import UserMenu from './user-menu';
import CartDropdown from './cart-dropdown';
import NotificationDropdown from './notification-dropdown';
import LanguageSwitcher from './language-switcher';

import { useTranslations } from 'next-intl';
import { useUiStore } from '@/store/use-ui-store';
import MobileSidebar from './mobile-sidebar';

export default function Navbar() {
    const pathname = usePathname();
    const t = useTranslations('Navbar');
    const { toggleMobileMenu } = useUiStore();

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <button
                    onClick={toggleMobileMenu}
                    className="lg:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <Menu size={24} strokeWidth={1.5} />
                </button>

                <Logo
                    brandName="Fasto"
                    brandLogo="/images/svgs/logo-icon.svg"
                />
            </div>

            <div className="hidden lg:flex items-center gap-2 pt-1 text-nowrap">
                {NAV_ITEMS.map((item) => {
                    const isActive =
                        item.href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(item.href);

                    return (
                        <NavItem
                            key={item.id}
                            label={t(`nav.${item.id}`)}
                            href={item.href}
                            icon={item.icon}
                            isActive={isActive}
                            alt={item.alt}
                        />
                    );
                })}
            </div>

            <div className="hidden lg:flex items-center mt-2">
                <Input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    inputSize="md"
                    startIcon={
                        <Search
                            size={22}
                            strokeWidth={1.5}
                            className="opacity-40"
                        />
                    }
                    containerClassName="w-[356px]"
                />
            </div>

            <div className="relative flex items-center gap-2 h-8">
                <div className="hidden lg:block">
                    <LanguageSwitcher />
                </div>
                <NotificationDropdown />
                <CartDropdown />
                <UserMenu />
            </div>

            <MobileSidebar />
        </div>
    );
}
