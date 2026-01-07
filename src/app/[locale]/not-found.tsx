'use client';

import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
    const t = useTranslations('NotFound');

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center animate-in fade-in duration-700">
            {/* Illustration/Icon Container */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-[#B44734]/10 rounded-full blur-3xl scale-150" />
                <div className="relative w-32 h-32 md:w-48 md:h-48 bg-white border-4 border-[#B44734]/20 rounded-full flex items-center justify-center shadow-2xl">
                    <UtensilsCrossed
                        size={80}
                        className="text-[#B44734] md:w-24 md:h-24"
                        strokeWidth={1.5}
                    />
                </div>
                {/* 404 Text */}
                <span className="absolute -bottom-4 -right-4 bg-[#B44734] text-white text-xl md:text-2xl font-black px-4 py-2 rounded-2xl rotate-12 shadow-lg">
                    404
                </span>
            </div>

            {/* Content */}
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                {t('title')}
            </h1>
            <p className="max-w-md text-gray-500 text-base md:text-lg mb-10 leading-relaxed font-medium">
                {t('description')}
            </p>

            {/* Action Button */}
            <Link
                href="/"
                className="inline-flex items-center justify-center px-10 py-4 bg-[#B44734] hover:bg-[#9a3c2c] text-white text-lg font-bold rounded-2xl transition-all shadow-[0_8px_30px_rgba(180,71,52,0.3)] hover:shadow-[0_12px_40px_rgba(180,71,52,0.4)] hover:-translate-y-1 active:scale-95"
            >
                {t('backHome')}
            </Link>

            {/* Decorative elements */}
            <div className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-[#B44734]/20" />
            <div className="absolute top-1/3 right-10 w-3 h-3 rounded-full bg-[#B44734]/10" />
            <div className="absolute bottom-1/4 left-1/4 w-4 h-4 rounded-full bg-[#B44734]/5" />
        </div>
    );
}
