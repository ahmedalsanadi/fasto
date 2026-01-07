'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Product } from '@/data/mock'; // Updated path
import ProductGallery from './product-details/product-gallery';
import ProductShareActions from './product-details/product-share-actions';
import ProductInfo from './product-details/product-info';
import ProductAllergies from './product-details/product-allergies';
import ProductActionBar from './product-details/product-action-bar';
import SizeSelector from './product-details/size-selector';
import AddonSelector from './product-details/addon-selector';
import SauceSelector from './product-details/sauce-selector';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { useCartActions } from '@/hooks/use-cart-actions';

interface ProductDetailsProps {
    product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
    const t = useTranslations('Product');

    const [selectedVarietyId, setSelectedVarietyId] = useState<string>(
        product.varieties.find((v) => v.isDefault)?.id ||
            product.varieties[0].id,
    );
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [selectedSauces, setSelectedSauces] = useState<
        Record<string, number>
    >({});
    const [quantity, setQuantity] = useState(1);

    const selectedVariety = useMemo(
        () => product.varieties.find((v) => v.id === selectedVarietyId)!,
        [selectedVarietyId, product.varieties],
    );

    const calculateTotalPrice = () => {
        let price = selectedVariety.price;

        // Addons
        selectedAddons.forEach((id) => {
            const addon = product.addons.find((a) => a.id === id);
            if (addon) price += addon.price;
        });

        // Sauces
        Object.entries(selectedSauces).forEach(([id, qty]) => {
            const sauce = product.sauces.find((s) => s.id === id);
            if (sauce) price += sauce.price * qty;
        });

        return price * quantity;
    };

    const toggleAddon = (id: string) => {
        setSelectedAddons((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const updateSauceQuantity = (id: string, delta: number) => {
        setSelectedSauces((prev) => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            }
            return { ...prev, [id]: next };
        });
    };

    const { addToCart } = useCartActions();

    const handleAddToCart = () => {
        // Create a unique key for this specific configuration
        const addonsKey = selectedAddons.sort().join(',');
        const saucesKey = JSON.stringify(selectedSauces);
        const uniqueId = `${product.id}-${selectedVarietyId}-${addonsKey}-${saucesKey}`;

        addToCart(
            {
                id: uniqueId,
                name: product.name,
                image: product.images[0],
                price: calculateTotalPrice() / quantity,
                categoryId: 'detailed',
                metadata: {
                    productId: product.id,
                    variety: selectedVariety,
                    addons: selectedAddons,
                    sauces: selectedSauces,
                },
            },
            quantity,
        );
    };

    return (
        <div className="flex flex-col gap-16 pb-24 relative pt-4 px-2 md:px-4">
            <div className="flex flex-col gap-6">
                {/* Breadcrumbs */}
                <Breadcrumbs
                    items={[
                        { label: t('home'), href: '/' },
                        { label: t('products'), href: '/products' },
                        { label: product.name },
                    ]}
                />

                {/* Top Section: Info & Image */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
                    {/* Info Column */}
                    <div className="lg:col-span-7 flex flex-col gap-8 order-2 ">
                        <ProductShareActions />

                        <ProductInfo
                            name={product.name}
                            description={product.description}
                            calories={
                                selectedVariety.calories || product.calories
                            }
                            prepTime={
                                selectedVariety.prepTime || product.prepTime
                            }
                        />

                        <ProductAllergies allergies={product.allergies} />

                        <ProductActionBar
                            totalPrice={calculateTotalPrice()}
                            originalPrice={selectedVariety.originalPrice}
                            quantity={quantity}
                            setQuantity={setQuantity}
                            onAddToCart={handleAddToCart}
                        />
                    </div>

                    {/* Gallery Column */}
                    <div className="lg:col-span-5 order-1 ">
                        <div className="sticky top-24">
                            <ProductGallery images={product.images} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Customization Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <SizeSelector
                    varieties={product.varieties}
                    selectedVarietyId={selectedVarietyId}
                    onSelect={setSelectedVarietyId}
                />

                <AddonSelector
                    addons={product.addons}
                    selectedAddons={selectedAddons}
                    onToggle={toggleAddon}
                />

                <SauceSelector
                    sauces={product.sauces}
                    selectedSauces={selectedSauces}
                    onUpdateQuantity={updateSauceQuantity}
                />
            </div>
        </div>
    );
}
