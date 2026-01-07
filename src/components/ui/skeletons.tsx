import React from 'react';

export const CategorySkeleton = () => (
    <div className="shrink-0 w-24 md:w-32 animate-pulse">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-full mx-auto mb-3" />
        <div className="h-4 bg-gray-200 rounded w-16 mx-auto" />
    </div>
);

export const ProductSkeleton = () => (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 animate-pulse">
        <div className="aspect-square w-full bg-gray-200 rounded-2xl mb-4" />
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
        <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-20" />
            <div className="h-10 w-10 bg-gray-100 rounded-xl" />
        </div>
    </div>
);

export const CategoriesGridSkeleton = () => (
    <div className="flex items-center gap-4 overflow-x-auto pb-4 px-4">
        {[...Array(8)].map((_, i) => (
            <CategorySkeleton key={i} />
        ))}
    </div>
);

export const ProductsGridSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
            <ProductSkeleton key={i} />
        ))}
    </div>
);
