import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface PaymentBadgeProps {
    src: string;
    altKey: string;
    width?: number;
    height?: number;
    className?: string;
}

const PaymentBadge = ({
    src,
    altKey,
    width = 80,
    height = 40,
    className = 'h-9 w-auto',
}: PaymentBadgeProps) => {
    const t = useTranslations('Footer');

    return (
        <Image
            src={src}
            alt={t(altKey)}
            width={width}
            height={height}
            className={className}
        />
    );
};

export default PaymentBadge;
