'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';
import { ProductAllergy } from '@/data/mock';

interface ProductAllergiesProps {
    allergies: ProductAllergy[];
}

interface AllergyItemProps {
    allergy: ProductAllergy;
}

const AllergyItem = React.memo(({ allergy }: AllergyItemProps) => (
    <div className="flex items-center gap-2 group transition-all">
        <span className="text-xs font-bold text-gray-400 group-hover:text-gray-600">
            {allergy.name}
        </span>
        <span className="text-xl group-hover:scale-110 transition-transform">
            {allergy.icon}
        </span>
    </div>
));

AllergyItem.displayName = 'AllergyItem';

export default function ProductAllergies({ allergies }: ProductAllergiesProps) {
    const t = useTranslations('Product');

    if (!allergies || allergies.length === 0) return null;

    return (
        <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 text-gray-900 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Info size={18} />
                </div>
                <h3 className="text-base font-bold">{t('allergies')}</h3>
            </div>

            <div className="flex flex-wrap gap-6 justify-start">
                {allergies.map((allergy, idx) => (
                    <AllergyItem key={idx} allergy={allergy} />
                ))}
            </div>
        </div>
    );
}
