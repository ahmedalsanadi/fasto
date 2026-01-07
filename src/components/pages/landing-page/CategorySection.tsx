import React from 'react';
import CategoryCard from '@/components/ui/CategoryCard';
import { Category } from '@/lib/api/types';

interface CategorySectionProps {
    initialCategories: Category[];
}

const CategorySection = ({ initialCategories }: CategorySectionProps) => {
    // Limit for landing page
    const displayCategories = (initialCategories || []).slice(0, 8);

    return (
        <section className="mt-8 mb-12">
            <div className="flex items-center gap-2.5 md:gap-4 overflow-x-auto pb-4 scrollbar-hide rtl justify-start lg:justify-center px-4">
                {displayCategories.map((cat) => (
                    <CategoryCard
                        key={cat.id}
                        label={cat.title}
                        image={cat.image_url}
                    />
                ))}
            </div>
        </section>
    );
};

export default CategorySection;
