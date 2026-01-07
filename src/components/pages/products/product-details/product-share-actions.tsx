'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Share2, Heart } from 'lucide-react';

interface ActionButtonProps {
    icon: React.ElementType;
    label: string;
}

const ActionButton = React.memo(({ icon: Icon, label }: ActionButtonProps) => (
    <button className="bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 sm:gap-2.5 px-3 py-2 sm:px-5 sm:py-2.5 rounded-md sm:rounded-xl transition-all group shadow-sm cursor-pointer">
        <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-400 group-hover:text-libero-red transition-colors" />
        <span className="text-xs sm:text-sm font-bold">{label}</span>
    </button>
));

ActionButton.displayName = 'ActionButton';

export default function ProductShareActions() {
    const t = useTranslations('Product');

    const actions = React.useMemo(
        () => [
            { label: t('share'), icon: Share2 },
            { label: t('favorite'), icon: Heart },
        ],
        [t],
    );

    return (
        <div className="flex items-center justify-end gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
                {actions.map((action, index) => (
                    <ActionButton key={index} {...action} />
                ))}
            </div>
            {/* Placeholder for Breadcrumbs logic if needed later */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400 font-medium">
                {/* In a real app, breadcrumbs would be here */}
            </div>
        </div>
    );
}
