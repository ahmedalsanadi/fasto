// src/app/[locale]/(protected)/my-addresses/AddressCard.tsx
'use client';

import { MapPin, Trash2, Edit, Check, Phone } from 'lucide-react';
import { Address } from '@/types/address';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { getAddressLabel, formatAddressForDisplay } from '@/lib/address';

interface AddressCardProps {
    address: Address;
    onEdit: (address: Address) => void;
    onDelete: (id: number) => void;
    onSetDefault: (id: number) => void;
    onMouseEnter?: () => void;
}

export default function AddressCard({
    address,
    onEdit,
    onDelete,
    onSetDefault,
    onMouseEnter,
}: AddressCardProps) {
    const t = useTranslations('MyAddresses');

    const isDefault = address.is_default;
    const label = getAddressLabel(address);
    const formatted = formatAddressForDisplay(address);

    return (
        <div
            onClick={() => !isDefault && onSetDefault(address.id)}
            onMouseEnter={onMouseEnter}
            className={cn(
                'group relative bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 border-2 transition-all cursor-pointer',
                isDefault
                    ? 'border-theme-primary shadow-lg shadow-theme-primary/10'
                    : 'border-gray-100 hover:border-theme-primary/30 shadow-sm',
            )}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 md:gap-4 flex-1">
                    <div
                        className={cn(
                            'mt-1 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                            isDefault
                                ? 'bg-theme-primary/10'
                                : 'bg-gray-50 group-hover:bg-theme-primary/5',
                        )}>
                        <MapPin
                            className={cn(
                                'w-5 h-5 md:w-6 md:h-6',
                                isDefault
                                    ? 'text-theme-primary'
                                    : 'text-gray-400 group-hover:text-theme-primary/70',
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-1 flex-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-base md:text-lg truncate">
                                {label}
                            </h3>
                            {isDefault && (
                                <span className="bg-theme-primary text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                                    {t('default')}
                                </span>
                            )}
                        </div>

                        <p className="text-gray-500 text-sm md:text-md leading-relaxed line-clamp-2 pr-2">
                            {formatted}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                            {address.phone && (
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <Phone className="w-3 h-3" />
                                    <span
                                        dir="ltr"
                                        className="text-xs font-semibold">
                                        {address.phone}
                                    </span>
                                </div>
                            )}
                            {address.recipient_name && (
                                <span className="text-xs text-gray-400 font-medium">
                                    {address.recipient_name}
                                </span>
                            )}
                        </div>

                        {(address.description || address.notes) && (
                            <p className="text-gray-400 text-xs mt-2 italic bg-gray-50/50 p-2 rounded-lg border border-dashed border-gray-200">
                                "{address.description || address.notes}"
                            </p>
                        )}
                    </div>
                </div>

                <div
                    className="flex flex-col gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => onEdit(address)}
                        className="p-2 md:p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-theme-primary/10 hover:text-theme-primary transition-all active:scale-90"
                        title="Edit">
                        <Edit className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                        onClick={() => onDelete(address.id)}
                        className="p-2 md:p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                        title="Delete">
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>
            </div>

            {/* Default Indicator (Overlay or subtle check) */}
            {isDefault && (
                <div className="absolute top-3 end-3 md:top-4 md:end-4">
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-theme-primary rounded-full flex items-center justify-center text-white shadow-sm ring-4 ring-white">
                        <Check className="w-3 h-3 md:w-4 md:h-4 stroke-2" />
                    </div>
                </div>
            )}
        </div>
    );
}
