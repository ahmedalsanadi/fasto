import React from 'react';
import { Category } from '@/services/types';
import CategoryCard from '@/components/ui/category-card';

interface CategoryTabsProps {
    categories: Category[];
    activeCategoryId: string | number;
    onCategorySelect: (id: string | number) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
    categories,
    activeCategoryId,
    onCategorySelect,
}) => {
    return (
        <div className="flex items-center gap-2.5 md:gap-4 overflow-x-auto pb-6 scrollbar-hide rtl justify-start lg:justify-center px-4">
            {categories.map((cat) => (
                <CategoryCard
                    key={cat.id}
                    label={cat.title}
                    image={cat.image_url}
                    isActive={activeCategoryId === cat.id}
                    onClick={() => onCategorySelect(cat.id)}
                />
            ))}
        </div>
    );
};

export default CategoryTabs;
