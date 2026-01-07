'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import CategoryTabs from './category-tabs';
import SubCategorySelection from './sub-category-selection';
import ProductsGrid from './products-grid';
import { storeService } from '@/services/store-service';
import { Category } from '@/services/types';

interface ProductsContentProps {
    initialCategorySlug?: string;
    locale?: string;
}

const ProductsContent = ({ initialCategorySlug }: ProductsContentProps) => {
    const t = useTranslations('Product');
    const router = useRouter();
    const pathname = usePathname();

    // Fetch Categories
    const { data: categories = [], isLoading: categoriesLoading } = useQuery<
        Category[]
    >({
        queryKey: ['categories'],
        queryFn: () => storeService.getCategories(true),
    });

    // Determine initial selected category based on slug
    const initialCategory = useMemo(() => {
        if (!initialCategorySlug || categories.length === 0)
            return { id: 'all' };
        return (
            categories.find((c) => c.slug === initialCategorySlug) || {
                id: 'all',
            }
        );
    }, [initialCategorySlug, categories]);

    const [selectedCategoryId, setSelectedCategoryId] = useState<
        string | number
    >(initialCategory.id);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<
        string | number
    >('');

    // Fetch Products based on filters
    const { data: productsRes, isLoading: productsLoading } = useQuery({
        queryKey: [
            'products',
            {
                category_id:
                    selectedSubCategoryId ||
                    (selectedCategoryId === 'all'
                        ? undefined
                        : selectedCategoryId),
            },
        ],
        queryFn: () =>
            storeService.getProducts({
                category_id:
                    selectedSubCategoryId ||
                    (selectedCategoryId === 'all'
                        ? undefined
                        : selectedCategoryId),
                per_page: 20,
            }),
    });

    const products = productsRes?.data || [];

    const activeCategory = useMemo(
        () => categories.find((c: Category) => c.id === selectedCategoryId),
        [categories, selectedCategoryId],
    );

    const subCategories = useMemo(
        () => activeCategory?.children || [],
        [activeCategory],
    );

    const handleCategoryChange = (id: string | number) => {
        setSelectedCategoryId(id);
        setSelectedSubCategoryId(''); // Reset subcategory

        const category = categories.find((c: Category) => c.id === id);

        // Update URL slug
        if (category && category.slug !== 'all') {
            router.replace(`${pathname}?category=${category.slug}`, {
                scroll: false,
            });
        } else {
            router.replace(pathname, { scroll: false });
        }
    };

    // Prepare display categories with "All"
    const displayCategories = useMemo(
        () => [{ id: 'all', slug: 'all', title: t('all') }, ...categories],
        [categories, t],
    );

    return (
        <div className="container mx-auto py-8">
            <h1 className="sr-only">{t('products')}</h1>
            <CategoryTabs
                categories={displayCategories}
                activeCategoryId={selectedCategoryId}
                onCategorySelect={handleCategoryChange}
            />

            {subCategories.length > 0 && (
                <SubCategorySelection
                    subCategories={subCategories}
                    activeSubCategoryId={selectedSubCategoryId}
                    onSubCategorySelect={setSelectedSubCategoryId}
                />
            )}

            <ProductsGrid
                products={products}
                loading={productsLoading || categoriesLoading}
            />
        </div>
    );
};

export default ProductsContent;
