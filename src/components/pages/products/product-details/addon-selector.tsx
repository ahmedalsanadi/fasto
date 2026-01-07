'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ProductAddon } from '@/data/mock';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import CustomizationCard from '@/components/pages/products/product-details/customization-card';
import CurrencySymbol from '@/components/ui/currency-symbol';

interface AddonSelectorProps {
    addons: ProductAddon[];
    selectedAddons: string[];
    onToggle: (id: string) => void;
}

interface AddonItemProps {
    addon: ProductAddon;
    isSelected: boolean;
    onToggle: (id: string) => void;
    t: (key: string) => string;
}

const AddonItem = React.memo(
    ({ addon, isSelected, onToggle, t: _t }: AddonItemProps) => (
        <label className="flex items-center justify-between py-3 cursor-pointer group hover:bg-gray-50/50 -mx-2 px-2 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                        isSelected
                            ? 'border-libero-red bg-libero-red text-white'
                            : 'border-gray-200 group-hover:border-gray-300',
                    )}
                >
                    {isSelected && <Check size={14} strokeWidth={3} />}
                </div>
                <span
                    className={cn(
                        'text-md font-bold transition-colors',
                        isSelected ? 'text-gray-900' : 'text-gray-700',
                    )}
                >
                    {addon.name}
                </span>
            </div>
            <div className="flex items-center gap-1.5">
                <span className="text-md font-bold text-gray-900 leading-none">
                    + {addon.price}
                </span>
                <CurrencySymbol className="w-4 h-4" />
            </div>
            <input
                type="checkbox"
                className="hidden"
                checked={isSelected}
                onChange={() => onToggle(addon.id)}
            />
        </label>
    ),
);

AddonItem.displayName = 'AddonItem';

export default function AddonSelector({
    addons,
    selectedAddons,
    onToggle,
}: AddonSelectorProps) {
    const t = useTranslations('Product');

    return (
        <CustomizationCard
            title={t('addons')}
            badge={{ text: t('optional'), variant: 'optional' }}
            description={t('maxAddons', {
                max: 8,
                current: selectedAddons.length,
            })}
        >
            <div className="flex flex-col divide-y divide-gray-50">
                {addons.map((addon) => (
                    <AddonItem
                        key={addon.id}
                        addon={addon}
                        isSelected={selectedAddons.includes(addon.id)}
                        onToggle={onToggle}
                        t={t}
                    />
                ))}
            </div>
        </CustomizationCard>
    );
}
