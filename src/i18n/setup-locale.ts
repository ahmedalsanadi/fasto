//src/i18n/setup-locale.ts
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

/**
 * Sets the request locale and validates it.
 * This is essential for Static Rendering (SSG) in Next.js App Router.
 * It must be called in every layout and page that uses next-intl in the [locale] segment.
 */
export function setupLocale(locale: string) {
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    // Enable static rendering
    setRequestLocale(locale);
}
