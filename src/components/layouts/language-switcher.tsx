//src/components/layouts/LanguageSwitcher.tsx
'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Globe } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const LanguageSwitcher = () => {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();

    const changeLanguage = (newLanguage: string) => {
        if (newLanguage === locale) return;
        document.cookie = `NEXT_LOCALE=${newLanguage}; path=/;`;
        router.push(pathname, { locale: newLanguage });
        router.refresh();
    };

    return (
        <DropdownMenu dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors outline-none cursor-pointer">
                    <Globe size={24} strokeWidth={1.5} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[120px]">
                <DropdownMenuItem onClick={() => changeLanguage('en')}>
                    English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('ar')}>
                    العربية
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageSwitcher;
