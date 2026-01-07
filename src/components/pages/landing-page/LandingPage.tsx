//src/components/pages/landing-page/LandingPage.tsx
import HeroSlider from './HeroSlider';
import CategorySection from './CategorySection';
import PromotionsSection from './PromotionsSection';
import { Category, Product, PaginationMeta } from '@/lib/api/types';
import { Suspense } from 'react';
import {
    CategoriesGridSkeleton,
    ProductsGridSkeleton,
} from '@/components/ui/skeletons';

interface LandingPageProps {
    categoriesPromise: Promise<Category[] | null>;
    productsPromise: Promise<{ data: Product[]; meta: PaginationMeta } | null>;
}

export default function LandingPage({
    categoriesPromise,
    productsPromise,
}: LandingPageProps) {
    return (
        <div className="pb-12 bg-white">
            <HeroSlider />

            <div className="container mx-auto px-4 mt-8">
                {/* Consolidate Suspense to prevent multiple layout shifts */}
                <Suspense
                    fallback={
                        <div className="space-y-12">
                            <CategoriesGridSkeleton />
                            <ProductsGridSkeleton />
                        </div>
                    }>
                    <div className="space-y-8">
                        <CategorySectionFetcher promise={categoriesPromise} />
                        <PromotionsSectionFetcher promise={productsPromise} />
                    </div>
                </Suspense>
            </div>
        </div>
    );
}

async function CategorySectionFetcher({
    promise,
}: {
    promise: Promise<Category[] | null>;
}) {
    const categories = await promise.catch(() => []);
    return <CategorySection initialCategories={categories || []} />;
}

async function PromotionsSectionFetcher({
    promise,
}: {
    promise: Promise<{ data: Product[]; meta: PaginationMeta } | null>;
}) {
    const response = await promise.catch(() => ({
        data: [],
        meta: {} as any,
    }));
    return <PromotionsSection initialProducts={response?.data || []} />;
    
}
