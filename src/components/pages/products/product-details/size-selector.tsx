'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ProductVariety } from '@/data/mock';
import { cn } from '@/lib/utils';
import CustomizationCard from '@/components/pages/products/product-details/customization-card';
import CurrencySymbol from '@/components/ui/currency-symbol';

interface SizeSelectorProps {
    varieties: ProductVariety[];
    selectedVarietyId: string;
    onSelect: (id: string) => void;
}

interface VarietyItemProps {
    v: ProductVariety;
    isSelected: boolean;
    onSelect: (id: string) => void;
    t: (key: string) => string;
}

const VarietyItem = React.memo(
    ({ v, isSelected, onSelect, t }: VarietyItemProps) => (
        <label className="flex items-center justify-between py-3 cursor-pointer group hover:bg-gray-50 -mx-2 px-2 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                        isSelected
                            ? 'border-libero-red bg-white'
                            : 'border-gray-200 group-hover:border-gray-300',
                    )}
                >
                    {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-libero-red shadow-[0_0_8px_rgba(180,75,58,0.3)]" />
                    )}
                </div>
                <div className="flex flex-col gap-0.5">
                    <span
                        className={cn(
                            'text-md font-bold transition-colors',
                            isSelected ? 'text-gray-900' : 'text-gray-700',
                        )}
                    >
                        {v.name}
                    </span>
                    {(v.calories || v.prepTime) && (
                        <div className="flex items-center gap-2 mt-0.5">
                            {v.calories && (
                                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100/50">
                                    {v.calories} {t('calories')}
                                </span>
                            )}
                            {v.prepTime && (
                                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100/50">
                                    {v.prepTime} {t('prepTime')}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                        <span className="text-md font-bold text-gray-900 leading-none">
                            {v.price}
                        </span>
                        <CurrencySymbol className="w-3.5 h-3.5" />
                    </div>
                    {v.originalPrice && (
                        <div className="flex items-center gap-1 opacity-60">
                            <span className="text-[12px] text-gray-500 line-through font-semibold leading-none">
                                {v.originalPrice}
                            </span>
                            <CurrencySymbol className="w-3 h-3" />
                        </div>
                    )}
                </div>
            </div>

            <input
                type="radio"
                className="hidden"
                checked={isSelected}
                onChange={() => onSelect(v.id)}
            />
        </label>
    ),
);

VarietyItem.displayName = 'VarietyItem';

export default function SizeSelector({
    varieties,
    selectedVarietyId,
    onSelect,
}: SizeSelectorProps) {
    const t = useTranslations('Product');

    return (
        <CustomizationCard
            title={t('size')}
            badge={{ text: t('required'), variant: 'required' }}
        >
            <div className="flex flex-col divide-y divide-gray-50">
                {varieties.map((v) => (
                    <VarietyItem
                        key={v.id}
                        v={v}
                        isSelected={selectedVarietyId === v.id}
                        onSelect={onSelect}
                        t={t}
                    />
                ))}
            </div>
        </CustomizationCard>
    );
}
