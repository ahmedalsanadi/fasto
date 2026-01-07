'use client';

import { X, Search } from 'lucide-react';
import { useUiStore } from '@/store/use-ui-store';
import { NAV_ITEMS } from '@/config/nav-items';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import NavItem from './nav-item';
import { Input } from '../ui/input';
import Logo from './logo';

import NotificationDropdown from './notification-dropdown';
import LanguageSwitcher from './language-switcher';

export default function MobileSidebar() {
    const { isMobileMenuOpen, setMobileMenuOpen } = useUiStore();
    const t = useTranslations('Navbar');
    const pathname = usePathname();
    const locale = useLocale();
    const isArabic = locale === 'ar';

    if (!isMobileMenuOpen) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <div
                className={`absolute top-0 ${
                    isArabic ? 'right-0' : 'left-0'
                } h-full w-[280px] bg-libero-red shadow-2xl transition-transform duration-300 ease-in-out flex flex-col`}
            >
                <div className="p-4 flex items-center justify-between border-b border-white/10 bg-libero-red text-white">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <Logo
                            brandName="Fasto"
                            brandLogo="/images/svgs/logo-icon.svg"
                        />
                    </div>

                    <div className="flex items-center gap-1">
                        <LanguageSwitcher />
                        <NotificationDropdown />
                    </div>
                </div>

                <div className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto">
                    {/* Search in Sidebar */}
                    <div className="mb-2">
                        <Input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            inputSize="md"
                            startIcon={
                                <Search size={20} className="text-white/40" />
                            }
                            containerClassName="w-full bg-white/5 border-white/10 focus-within:bg-white/10 focus-within:ring-white/20"
                            className="text-white placeholder:text-white/40"
                        />
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex flex-col gap-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive =
                                item.href === '/'
                                    ? pathname === '/'
                                    : pathname.startsWith(item.href);

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <NavItem
                                        label={t(`nav.${item.id}`)}
                                        href={item.href}
                                        icon={item.icon}
                                        isActive={isActive}
                                        alt={item.alt}
                                    />
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom Footer or secondary links could go here if needed */}
                <div className="p-6 mt-auto border-t border-white/10">
                    <p className="text-white/40 text-[10px] text-center">
                        © {new Date().getFullYear()} Fasto Restaurant Store
                    </p>
                </div>
            </div>
        </div>
    );
}
