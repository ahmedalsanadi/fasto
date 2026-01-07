'use client';

import React, {
    createContext,
    useContext,
    useLayoutEffect,
    useEffect,
} from 'react';
import { StoreConfig } from '@/lib/api/types';
import { useCartStore } from '@/store/useCartStore';
import { isValidColor } from '@/lib/api/utils';

interface StoreContextType {
    config: StoreConfig;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({
    children,
    config,
}: {
    children: React.ReactNode;
    config: StoreConfig;
}) {
    // Hydrate cart store on mount
    useEffect(() => {
        useCartStore.persist.rehydrate();
        useCartStore.getState().setHasHydrated(true);
    }, []);

    useLayoutEffect(() => {
        const root = document.documentElement;
        const { primary_color: primary, secondary_color: secondary } =
            config.theme;

        const updateVar = (name: string, val?: string) => {
            if (val && isValidColor(val)) root.style.setProperty(name, val);
        };

        updateVar('--primary', primary);
        updateVar('--secondary', secondary);

        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta && primary && isValidColor(primary))
            meta.setAttribute('content', primary);

        return () => {
            root.style.removeProperty('--primary');
            root.style.removeProperty('--secondary');
        };
    }, [config]);

    return (
        <StoreContext.Provider value={{ config }}>
            {children}
        </StoreContext.Provider>
    );
}

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context)
        throw new Error('useStore must be used within a StoreProvider');
    return context;
};
