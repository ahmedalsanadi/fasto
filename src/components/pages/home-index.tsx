'use client';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ModeToggle } from '../layouts/mode-toggle';
import LanguageSwitcher from '../layouts/language-switcher';

export default function HomeIndex() {
    const t = useTranslations('Index');

    return (
        <div className="flex flex-col min-h-screen">
            <header className="w-full border-b bg-background/95 sticky top-0 z-50">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="h-16 flex items-center justify-between">
                        <Link
                            className="flex items-center gap-2 group"
                            href="/"
                            aria-label="Home"
                        >
                            <Globe className="h-6 w-6 text-primary" />
                            <span className="font-bold text-lg lg:text-xl">
                                {t('boilerplateName')}
                            </span>
                        </Link>

                        <nav className="flex items-center gap-4">
                            <LanguageSwitcher />
                            <ModeToggle />
                        </nav>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto max-w-7xl px-4 py-8">
                {/* Content will go here later */}
            </main>
        </div>
    );
}
