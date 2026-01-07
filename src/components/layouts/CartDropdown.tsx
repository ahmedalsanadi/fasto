'use client';

import { ShoppingCart, X, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { Link } from '@/i18n/navigation';
import CurrencySymbol from '../ui/CurrencySymbol';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '../ui/DropdownMenu';
import React, { useEffect, useState } from 'react';

const CartItemImage = ({ src, alt }: { src: string; alt: string }) => {
    const [hasError, setHasError] = useState(false);
    const fallbackImage = '/images/svgs/logo-icon.svg';

    return (
        <Image
            src={hasError ? fallbackImage : src}
            alt={alt || ''}
            fill
            className={`object-contain p-1 ${
                hasError ? 'opacity-40 grayscale p-2' : ''
            }`}
            onError={() => setHasError(true)}
        />
    );
};

const CartDropdown = () => {
    const t = useTranslations('Cart');
    const { items, removeItem, getTotalItems, getTotalPrice } = useCartStore();
    const count = getTotalItems();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors outline-none cursor-pointer">
                    <ShoppingCart size={24} strokeWidth={1.5} />
                    {isMounted && count > 0 && (
                        <span className="absolute bottom-1 left-1 bg-[#F3C450] text-[#030213] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white/20">
                            {count}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-[320px] md:w-[380px] p-0 overflow-hidden rounded-3xl border-gray-100 shadow-2xl bg-white">
                {/* Clean Header (No Red Background) */}
                <div className="p-4 border-b border-gray-50">
                    <h3 className="font-bold flex items-center gap-2 text-gray-900">
                        <ShoppingCart size={18} />
                        {t('title')}
                    </h3>
                </div>

                {/* Items List (Previous Body Content Style) */}
                <div className="max-h-[400px] overflow-y-auto p-4 scrollbar-hide">
                    {!isMounted || items.length === 0 ? (
                        <div className="text-center py-10">
                            <ShoppingCart
                                size={40}
                                className="mx-auto text-gray-200 mb-3"
                            />
                            <p className="text-sm font-medium text-gray-400">
                                {t('empty')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 group relative">
                                    <div className="relative w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                        <CartItemImage
                                            src={item.image}
                                            alt={item.name}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-gray-900 truncate">
                                            {item.name}
                                        </h4>
                                        {item.metadata?.variety && (
                                            <p className="text-[10px] text-gray-400 font-medium">
                                                {item.metadata.variety.name}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            x{item.quantity}
                                        </p>
                                        <div className="flex items-center gap-1 text-sm font-black text-[#B44734] mt-1">
                                            <span>
                                                {item.price * item.quantity}
                                            </span>
                                            <CurrencySymbol className="w-3 h-3" />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer (Red Button Style) */}
                {isMounted && items.length > 0 && (
                    <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-500 font-bold ">
                                {t('total')}
                            </span>
                            <div className="flex items-center gap-1 text-lg font-black text-gray-900">
                                <span>{getTotalPrice()}</span>
                                <CurrencySymbol className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Link
                                href="/cart"
                                className="w-full bg-gray-100 text-gray-900 text-center font-bold py-3 rounded-xl block transition-all hover:bg-gray-200 border border-gray-200/50">
                                {t('viewCart')}
                            </Link>

                            <Link
                                href="/cart"
                                className="w-full bg-[#B44734] text-white text-center font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-[#9a3c2c] active:scale-95 shadow-lg shadow-red-900/10">
                                {t('checkout')}
                                <ArrowRight
                                    size={18}
                                    className="rtl:rotate-180"
                                />
                            </Link>
                        </div>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default CartDropdown;
