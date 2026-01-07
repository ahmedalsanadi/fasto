'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LayoutGrid } from 'lucide-react';

interface CategoryCardProps {
    label: string;
    image?: string;
    isMain?: boolean;
    isActive?: boolean;
    variant?: 'default' | 'circular';
    onClick?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
    label,
    image,
    isMain,
    isActive,
    variant = 'default',
    onClick,
}) => {
    const [hasError, setHasError] = useState(false);
    const fallbackImage = '/images/svgs/logo-icon.svg';

    if (variant === 'circular') {
        return (
            <div
                onClick={onClick}
                className="flex flex-col items-center gap-2 cursor-pointer group min-w-[70px]">
                <div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 p-1.5 transition-all flex items-center justify-center overflow-hidden
                    ${
                        isActive
                            ? 'border-[#B44734] bg-white shadow-md scale-110'
                            : 'border-transparent bg-white/50 group-hover:border-[#B44734]/30'
                    }`}>
                    {image ? (
                        <div className="relative w-full h-full">
                            <Image
                                src={hasError ? fallbackImage : image}
                                alt={label || ''}
                                fill
                                className={`object-cover rounded-full ${
                                    hasError ? 'p-2 opacity-50' : ''
                                }`}
                                onError={() => setHasError(true)}
                            />
                        </div>
                    ) : (
                        <div className="text-[10px] font-bold text-center leading-tight">
                            {label}
                        </div>
                    )}
                </div>
                <span
                    className={`text-[10px] md:text-xs font-bold transition-colors
                    ${
                        isActive
                            ? 'text-[#B44734]'
                            : 'text-gray-600 group-hover:text-gray-900'
                    }`}>
                    {label}
                </span>
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className="flex flex-col items-center min-w-[85px] md:min-w-[110px] group cursor-pointer">
            <div
                className={`w-full aspect-[4/5.2] bg-white border rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-2.5 p-3 shadow-xs transition-all
                ${
                    isActive
                        ? 'border-[#B44734] shadow-md'
                        : 'border-gray-200/60 group-hover:shadow-md group-hover:border-[#B44734]/20'
                }`}>
                {isMain ? (
                    <div className="flex flex-col items-center gap-3 w-full">
                        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                            <LayoutGrid
                                size={32}
                                className={
                                    isActive
                                        ? 'text-[#B44734]'
                                        : 'text-[#B44734]'
                                }
                                strokeWidth={1.5}
                            />
                        </div>
                        <span
                            className={`text-[11px] md:text-sm font-bold transition-colors
                            ${
                                isActive
                                    ? 'text-[#B44734]'
                                    : 'text-gray-800 group-hover:text-[#B44734]'
                            }`}>
                            {label}
                        </span>
                    </div>
                ) : (
                    <>
                        <div className="relative w-10 h-10 md:w-14 md:h-14">
                            <Image
                                src={image && !hasError ? image : fallbackImage}
                                alt={label || ''}
                                fill
                                className={`object-contain ${
                                    hasError ? 'opacity-40 grayscale p-1' : ''
                                }`}
                                onError={() => setHasError(true)}
                            />
                        </div>
                        <span
                            className={`text-[11px] md:text-sm font-bold transition-colors leading-tight
                            ${
                                isActive
                                    ? 'text-[#B44734]'
                                    : 'text-gray-800 group-hover:text-[#B44734]'
                            }`}>
                            {label}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
};

export default CategoryCard;
