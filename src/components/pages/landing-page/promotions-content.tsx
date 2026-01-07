'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from '@/components/ui/product-card';
import { useCartActions } from '@/hooks/use-cart-actions';
import { Product } from '@/services/types';

interface PromotionsSectionProps {
    initialProducts: Product[];
}

const PromotionsSection = ({ initialProducts }: PromotionsSectionProps) => {
    const t = useTranslations('Promotions');
    const { addToCart } = useCartActions();

    return (
        <section className="mt-12 mb-16" dir="rtl">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                    {t('title')}
                </h2>
                <button className="bg-gray-100/80 hover:bg-gray-200 text-gray-600 px-6 py-2 rounded-xl text-sm font-bold transition-all">
                    {t('more')}
                </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {initialProducts?.map((product) => {
                    const hasDiscount =
                        product.sale_price &&
                        Number(product.sale_price) < Number(product.price);
                    let discountAmount = '';
                    if (hasDiscount) {
                        const savings =
                            Number(product.price) - Number(product.sale_price!);
                        const percentage = Math.round(
                            (savings / Number(product.price)) * 100,
                        );
                        discountAmount = `${percentage}%`;
                    }

                    return (
                        <ProductCard
                            key={product.id}
                            name={product.title}
                            image={product.cover_image_url}
                            price={product.sale_price || product.price}
                            oldPrice={hasDiscount ? product.price : undefined}
                            href={`/products/${product.id}`}
                            discountBadge={
                                hasDiscount
                                    ? t('save', { amount: discountAmount })
                                    : undefined
                            }
                            addToCartLabel={t('addToCart')}
                            onAddToCartClick={() => {
                                addToCart({
                                    id: String(product.id),
                                    name: product.title,
                                    image: product.cover_image_url,
                                    price: Number(
                                        product.sale_price || product.price,
                                    ),
                                    categoryId: String(
                                        product.categoryId || 'promo',
                                    ),
                                });
                            }}
                        />
                    );
                })}
            </div>
        </section>
    );
};

export default PromotionsSection;
