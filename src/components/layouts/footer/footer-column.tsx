import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface FooterColumnProps {
    titleKey: string;
    links: { labelKey: string; href: string }[];
}

const FooterColumn = ({ titleKey, links }: FooterColumnProps) => {
    const t = useTranslations('Footer');

    return (
        <div>
            <h4 className="font-black text-gray-900 mb-6 text-xl">
                {t(titleKey)}
            </h4>
            <ul className="space-y-4 text-gray-600 font-medium text-sm">
                {links.map((link, idx) => (
                    <li key={idx}>
                        <Link
                            href={link.href}
                            className="hover:text-[#B44734] transition-colors"
                        >
                            {t(link.labelKey)}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FooterColumn;
