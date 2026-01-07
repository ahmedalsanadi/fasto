'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Flame, Clock } from 'lucide-react';

interface ProductInfoProps {
    name: string;
    description: string;
    calories: number;
    prepTime: number;
}

interface InfoItemProps {
    icon: React.ElementType;
    value: string;
    iconColor: string;
}

const InfoItem = React.memo(
    ({ icon: Icon, value, iconColor }: InfoItemProps) => (
        <div className="flex items-center gap-2.5 px-4 py-2 bg-[#F8F9FA] rounded-2xl border border-gray-50">
            <div className={iconColor}>
                <Icon size={20} />
            </div>
            <span className="font-bold text-gray-600">{value}</span>
        </div>
    ),
);

InfoItem.displayName = 'InfoItem';

export default function ProductInfo({
    name,
    description,
    calories,
    prepTime,
}: ProductInfoProps) {
    const t = useTranslations('Product');

    const infoItems = React.useMemo(
        () => [
            {
                icon: Flame,
                value: `${calories} ${t('calories')}`,
                iconColor: 'text-orange-500',
            },
            {
                icon: Clock,
                value: `${prepTime} ${t('prepTime')}`,
                iconColor: 'text-blue-500',
            },
        ],
        [calories, prepTime, t],
    );

    return (
        <>
            <div className="space-y-5 ">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight">
                    {name}
                </h1>
                <p className="text-gray-500 font-medium leading-relaxed text-base max-w-2xl">
                    {description}
                </p>
            </div>

            <div className="flex items-center gap-4 justify-start ">
                {infoItems.map((item, index) => (
                    <InfoItem key={index} {...item} />
                ))}
            </div>
        </>
    );
}
