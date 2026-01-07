//src/components/layouts/SubHeader.tsx
'use client';

import { Building2, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function SubHeader() {
    const t = useTranslations('SubHeader');
    const [activeType, setActiveType] = useState('delivery');

    const orderTypes = [
        { id: 'dineIn', label: t('dineIn') },
        { id: 'pickup', label: t('pickup') },
        { id: 'delivery', label: t('delivery') },
    ];

    const activeStyle = 'bg-libero-red/5 text-libero-red border-libero-red/20';
    const inactiveStyle = 'bg-gray-50 text-gray-500 hover:border-gray-200';

    return (
        <div className="mt-4">
            {/* Desktop Layout - 100% Exact Restoration */}
            <div className="hidden lg:flex bg-white rounded-t-xl h-16 items-center justify-between px-4 shadow-t-sm border-t border-gray-200">
                <button
                    className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200 group"
                    aria-label={t('defaultBranch')}
                >
                    <div className="size-8 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50">
                        <Building2 className="size-4.5 text-gray-500" />
                    </div>
                    <span className="text-gray-900 font-semibold text-sm">
                        {t('defaultBranch')}
                    </span>
                    <ChevronDown className="size-3.5 text-gray-500 group-hover:text-libero-red transition-colors duration-200" />
                </button>

                <div className="flex items-center gap-4">
                    <span className="text-gray-900 font-medium text-sm whitespace-nowrap">
                        {t('selectOrderType')}
                    </span>
                    <div className="flex items-center gap-2">
                        {orderTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setActiveType(type.id)}
                                className={`
                                    h-10 px-4 rounded-md text-sm font-medium 
                                    transition-all duration-200 cursor-pointer border
                                    ${
                                        activeType === type.id
                                            ? activeStyle
                                            : inactiveStyle
                                    }
                                `}
                                aria-pressed={activeType === type.id}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Layout - Premium Redesign (Hidden on Desktop) */}
            <div className="lg:hidden flex flex-col gap-4">
                <div className="bg-white rounded-xl h-14 flex items-center px-4 shadow-sm border border-gray-200">
                    <button
                        className="flex items-center gap-2 w-full"
                        aria-label={t('defaultBranch')}
                    >
                        <div className="size-8 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 shrink-0">
                            <Building2 className="size-4.5 text-gray-500" />
                        </div>
                        <span className="text-gray-900 font-semibold text-sm truncate">
                            {t('defaultBranch')}
                        </span>
                        <ChevronDown className="size-3.5 text-gray-500 ml-auto" />
                    </button>
                </div>

                <div className="w-full bg-white/10 p-1 rounded-xl border border-white/10 backdrop-blur-sm flex items-center">
                    {orderTypes.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setActiveType(type.id)}
                            className={`
                                flex-1 h-10 rounded-lg text-xs font-bold 
                                transition-all duration-200 cursor-pointer 
                                ${
                                    activeType === type.id
                                        ? 'bg-white text-libero-red shadow-sm'
                                        : 'text-white/80 hover:bg-white/5'
                                }
                            `}
                            aria-pressed={activeType === type.id}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
