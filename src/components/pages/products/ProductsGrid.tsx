import React from 'react';
import { Product } from '@/lib/api/types';
import ProductCard from '@/components/ui/ProductCard';
import { useTranslations } from 'next-intl';
import { useCartActions } from '@/hooks/useCartActions';

interface ProductsGridProps {
    products: Product[];
    loading?: boolean;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ products, loading }) => {
    const t = useTranslations('Promotions');
    const { addToCart } = useCartActions();

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 px-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-gray-100 animate-pulse rounded-3xl aspect-3/4"
                    />
                ))}
            </div>
        );
    }

    if (!loading && (!products || products.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <span className="text-lg font-medium text-center px-4">
                    {t('noProducts') || 'No products found in this section'}
                </span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 px-4 mb-20">
            {products.map((product) => {
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
                                    product.categoryId || 'shop',
                                ),
                            });
                        }}
                    />
                );
            })}
        </div>
    );
};

export default ProductsGrid;
