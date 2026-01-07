'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
    return (
        <nav
            aria-label="Breadcrumb"
            className={cn(
                'flex items-center gap-2 text-sm md:text-md px-1 md:px-2 overflow-hidden pt-2',
                className,
            )}
        >
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <React.Fragment key={index}>
                        {item.href && !isLast ? (
                            <Link
                                href={item.href}
                                className="text-gray-500 hover:text-libero-red transition-colors font-medium whitespace-nowrap"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span
                                className={cn(
                                    'whitespace-nowrap truncate',
                                    isLast
                                        ? 'text-gray-900 font-bold'
                                        : 'text-gray-400 font-medium',
                                )}
                            >
                                {item.label}
                            </span>
                        )}

                        {!isLast && (
                            <ChevronRight className="w-3.5 h-3.5 text-gray-300 rtl:rotate-180 shrink-0" />
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;
