'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CurrencySymbolProps {
    className?: string;
}

const CurrencySymbol = ({ className }: CurrencySymbolProps) => {
    return (
        <Image
            src="/images/svgs/sar-riyal.svg"
            alt="SAR"
            width={16}
            height={16}
            className={cn('inline-block opacity-90', className)}
        />
    );
};

export default CurrencySymbol;
