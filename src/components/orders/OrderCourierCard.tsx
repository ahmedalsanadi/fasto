// src/components/orders/OrderCourierCard.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Car, MessageCircle, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface OrderCourierCardProps {
    captainName?: string | null;
    captainPhone?: string | null;
    onTrackOnMap?: () => void;
}

export function OrderCourierCard({
    captainName,
    captainPhone,
    onTrackOnMap,
}: OrderCourierCardProps) {
    const t = useTranslations('Orders.courier');

    const subtitle =
        captainName?.trim() ?
            t('subtitleWithName', { name: captainName.trim() })
        :   t('subtitle');

    const telHref =
        captainPhone?.replace(/\s/g, '') ?
            `tel:${captainPhone.replace(/\s/g, '')}`
        :   undefined;

    return (
        <div className="bg-green-50 rounded-3xl p-6 flex flex-col gap-6 border border-green-100 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="bg-white p-3.5 rounded-2xl shadow-sm shrink-0">
                    <Car className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="text-green-700 font-bold text-lg leading-tight">
                        {t('title')}
                    </h3>
                    <p className="text-green-600/70 text-sm font-medium leading-tight">
                        {subtitle}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-gray-50 text-green-700 border-gray-200 h-10 rounded-xl font-semibold shadow-sm"
                    onClick={onTrackOnMap}>
                    <MapPin className="w-4 h-4" />
                    {t('actions.track')}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled
                    className="bg-white hover:bg-gray-50 text-green-700 border-gray-200 h-10 rounded-xl font-semibold shadow-sm opacity-60 cursor-not-allowed">
                    <MessageCircle className="w-4 h-4" />
                    {t('actions.message')}
                </Button>

                {telHref ?
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-gray-50 text-green-700 border-gray-200 h-10 rounded-xl font-semibold shadow-sm"
                        asChild>
                        <a href={telHref}>
                            <Phone className="w-4 h-4" />
                            {t('actions.call')}
                        </a>
                    </Button>
                :   <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled
                        className="bg-white text-green-700 border-gray-200 h-10 rounded-xl font-semibold shadow-sm opacity-60 cursor-not-allowed">
                        <Phone className="w-4 h-4" />
                        {t('actions.call')}
                    </Button>
                }
            </div>
        </div>
    );
}
