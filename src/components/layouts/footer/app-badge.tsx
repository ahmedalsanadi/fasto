import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface AppBadgeProps {
    src: string;
    altKey: string;
    href: string;
}

const AppBadge = ({ src, altKey, href }: AppBadgeProps) => {
    const t = useTranslations('Footer');

    return (
        <Link href={href}>
            <Image
                src={src}
                alt={t(altKey)}
                width={180}
                height={54}
                className="hover:scale-105 transition-transform"
            />
        </Link>
    );
};

export default AppBadge;
