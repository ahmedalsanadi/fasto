'use client';

import { useTranslations } from 'next-intl';
import { useCartStore, CartItem } from '@/store/use-cart-store';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';
import React from 'react';
import { useRouter } from '@/i18n/navigation';

export const useCartActions = () => {
    const addItem = useCartStore((state) => state.addItem);
    const t = useTranslations('Cart');
    const router = useRouter();

    const addToCart = (
        item: Omit<CartItem, 'quantity'>,
        quantity: number = 1,
    ) => {
        addItem(item, quantity);

        toast.success(t('added', { name: item.name }), {
            icon: <ShoppingCart size={18} className="text-[#B44734]" />,
            description: t('viewCart'),
            action: {
                label: t('viewCart'),
                onClick: () => router.push('/cart'),
            },
        });
    };

    return { addToCart };
};
