'use client';

import { use } from 'react';
import HeroSlider from './hero-slider';
import CategorySection from './category-section';
import PromotionsSection from './promotions-section';
import { Category, Product, PaginationMeta } from '@/services/types';

interface LandingPageProps {
    categoriesPromise: Promise<Category[] | null>;
    productsPromise: Promise<{ data: Product[]; meta: PaginationMeta } | null>;
}

export default function LandingPage({
    categoriesPromise,
    productsPromise,
}: LandingPageProps) {
    // Unwrap promises using React.use()
    // This allows the component to "wait" for data without manual Suspense wrappers here,
    // although it still needs a Suspense boundary higher up in the tree (in layout or page).
    const categories = use(categoriesPromise) || [];
    const productsResponse = use(productsPromise);
    const products = productsResponse?.data || [];

    return (
        <div className="pb-12 bg-white">
            <HeroSlider />

            <div className="container mx-auto px-4 mt-8 space-y-8">
                <CategorySection initialCategories={categories} />
                <PromotionsSection initialProducts={products} />
            </div>
        </div>
    );
}
