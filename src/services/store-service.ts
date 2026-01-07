import { fetchLibero, fetchLiberoFull } from './api';
import { StoreConfig, Product, PaginationMeta, Category } from './types';

/**
 * Service for store-related data fetching.
 */
export const storeService = {
    /**
     * Get store configuration including theme and home sections.
     */
    getConfig: () => fetchLibero<StoreConfig>('/store/config'),

    /**
     * Get all categories with optional tree structure.
     */
    getCategories: (tree: boolean = true) =>
        fetchLibero<Category[]>('/store/categories', { params: { tree } }),

    /**
     * List products with filtering and pagination.
     */
    async getProducts(params?: {
        search?: string;
        category_id?: number | string;
        is_featured?: boolean | string;
        is_latest?: boolean | string;
        page?: number;
        per_page?: number;
        sort?: string;
        order?: 'asc' | 'desc';
    }): Promise<{ data: Product[]; meta: PaginationMeta }> {
        const response = await fetchLiberoFull<Product[]>('/store/products', {
            params,
        });

        return {
            data: response.data,
            meta: response.meta || {
                current_page: 1,
                last_page: 1,
                per_page: params?.per_page || 10,
                total: response.data.length,
            },
        };
    },
};
