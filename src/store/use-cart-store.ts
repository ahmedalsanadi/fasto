import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItemMetadata {
    productId?: string | number;
    variety?: {
        id: string;
        name: string;
        price: number;
    };
    addons?: string[];
    sauces?: Record<string, number>;
    [key: string]: unknown;
}

export interface CartItem {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    categoryId: string;
    metadata?: CartItemMetadata;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            _hasHydrated: false,
            setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
            addItem: (
                item: Omit<CartItem, 'quantity'>,
                quantity: number = 1,
            ) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((i) => i.id === item.id);

                if (existingItem) {
                    set({
                        items: currentItems.map((i) =>
                            i.id === item.id
                                ? { ...i, quantity: i.quantity + quantity }
                                : i,
                        ),
                    });
                } else {
                    set({ items: [...currentItems, { ...item, quantity }] });
                }
            },
            removeItem: (id: string) => {
                set({
                    items: get().items.filter((i) => i.id !== id),
                });
            },
            updateQuantity: (id: string, quantity: number) => {
                if (quantity <= 0) {
                    get().removeItem(id);
                    return;
                }
                set({
                    items: get().items.map((i) =>
                        i.id === id ? { ...i, quantity } : i,
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            getTotalItems: () => {
                return get().items.reduce(
                    (total: number, item: CartItem) => total + item.quantity,
                    0,
                );
            },
            getTotalPrice: () => {
                return get().items.reduce(
                    (total: number, item: CartItem) =>
                        total + item.price * item.quantity,
                    0,
                );
            },
        }),
        {
            name: 'fasto-cart-storage',
            skipHydration: true,
        },
    ),
);
