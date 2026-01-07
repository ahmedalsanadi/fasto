'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CustomizationCardProps {
    title: string;
    badge?: {
        text: string;
        variant: 'required' | 'optional';
    };
    description?: string;
    children: React.ReactNode;
    className?: string;
}

const CustomizationCard = ({
    title,
    badge,
    description,
    children,
    className,
}: CustomizationCardProps) => {
    return (
        <div
            className={cn(
                'bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] flex flex-col h-full',
                className,
            )}
        >
            <div className="flex items-start justify-between mb-5">
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-[11px] font-medium text-gray-400">
                            {description}
                        </p>
                    )}
                </div>
                {badge && (
                    <span
                        className={cn(
                            'px-3 py-1 rounded-md text-[10px] font-bold border shrink-0',
                            badge.variant === 'required'
                                ? 'bg-red-50 text-red-500 border-red-200/60'
                                : 'bg-gray-50 text-gray-500 border-gray-200',
                        )}
                    >
                        {badge.text}
                    </span>
                )}
            </div>
            <div className="flex-1 flex flex-col">{children}</div>
        </div>
    );
};

export default CustomizationCard;
