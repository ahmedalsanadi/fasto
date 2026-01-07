//src/lib/api/services.ts
import { fetchLibero } from './client';
import { StoreConfig, Product, PaginationMeta, Category } from './types';

export const storeService = {
    /**
     * Get store configuration including theme, app version, and home sections.
     */
    getConfig: async (): Promise<StoreConfig> => {
        return fetchLibero<StoreConfig>('/store/config');
    },

    /**
     * Get all categories with optional tree structure.
     */
    getCategories: async (tree: boolean = true): Promise<Category[]> => {
        return fetchLibero<Category[]>('/store/categories', {
            params: { tree },
        });
    },

    /**
     * List products with optional filtering and pagination.
     */
    getProducts: async (params?: {
        search?: string;
        category_id?: number | string;
        is_featured?: boolean | string;
        is_latest?: boolean | string;
        page?: number;
        per_page?: number;
        sort?: string;
        order?: 'asc' | 'desc';
    }): Promise<{ data: Product[]; meta: PaginationMeta }> => {
        const data = await fetchLibero<Product[]>('/store/products', {
            params,
        });
        return { data, meta: {} as any };
    },
};
