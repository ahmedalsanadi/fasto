'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, Plus } from 'lucide-react';
import CurrencySymbol from './CurrencySymbol';
import { Link } from '@/i18n/navigation';

interface ProductCardProps {
    name: string;
    image: string;
    price: number | string;
    oldPrice?: number | string;
    discountBadge?: string;
    addToCartLabel?: string;
    href?: string;
    onWishlistClick?: (e: React.MouseEvent) => void;

    onAddToCartClick?: (e: React.MouseEvent) => void;
    onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
    name,
    image,
    price,
    oldPrice,
    discountBadge,
    addToCartLabel,
    href = '#',
    onWishlistClick,
    onAddToCartClick,
    onClick,
}) => {
    const [hasError, setHasError] = useState(false);
    const fallbackImage = '/images/svgs/logo-icon.svg';

    return (
        <div
            onClick={onClick}
            className="bg-white border border-gray-100 rounded-xl md:rounded-3xl p-4 md:p-6 relative group shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-500 flex flex-col items-center">
            {/* Wishlist Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onWishlistClick?.(e);
                }}
                className="absolute top-4 right-4 w-9 h-9 md:w-10 md:h-10 bg-white shadow-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 transition-all z-20 border border-gray-50 cursor-pointer">
                <Heart className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Link wrapper for Image and Info */}
            <Link
                href={href}
                className="w-full flex flex-col items-center z-10">
                {/* Product Image */}
                <div className="relative w-full aspect-square mb-6 group-hover:scale-105 transition-transform duration-500">
                    <Image
                        src={hasError ? fallbackImage : image}
                        alt={name || ''}
                        fill
                        className={`object-contain drop-shadow-xl ${
                            hasError ? 'opacity-40 grayscale p-8' : ''
                        }`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={() => setHasError(true)}
                    />
                </div>

                {/* Product Info */}
                <div className="w-full text-right space-y-2">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 line-clamp-1">
                        {name}
                    </h3>
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <span className="text-xl md:text-2xl font-black text-gray-900">
                                {price}
                            </span>
                            <CurrencySymbol className="md:w-4 md:h-4" />
                            {oldPrice && (
                                <span className="text-xs md:text-sm text-gray-400 line-through mr-1">
                                    {oldPrice}
                                </span>
                            )}
                        </div>
                        {discountBadge && (
                            <span className="text-[10px] md:text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg shrink-0">
                                {discountBadge}
                            </span>
                        )}
                    </div>
                </div>
            </Link>

            {/* Add to Cart Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onAddToCartClick?.(e);
                }}
                className="w-full mt-8 bg-[#FEF4F1] hover:bg-[#FDE7E0] text-[#B44734] font-bold py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 border border-[#FDE7E0]/50 shadow-sm z-20 cursor-pointer">
                <Plus className="w-5 h-5" />
                <span className="text-sm md:text-base">
                    {addToCartLabel || 'Add to Cart'}
                </span>
            </button>
        </div>
    );
};

export default ProductCard;
