//src/components/providers/store-provider.tsx
'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { StoreConfig } from '@/lib/api/types';

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
    // Expertise Note: We use a custom style tag to inject CSS variables.
    // This is better than inline styles on every component as it keeps the DOM clean
    // and allows standard CSS class usage (e.g., bg-[var(--primary)]).
    const themeStyles = `
    :root {
      --primary: ${config.theme.primary_color};
      --secondary: ${config.theme.secondary_color};
      --primary-foreground: 210 40% 98%;
      --secondary-foreground: 222.2 47.4% 11.2%;
    }
    
    .primary-bg { background-color: var(--primary); }
    .primary-text { color: var(--primary); }
    .secondary-bg { background-color: var(--secondary); }
    .secondary-text { color: var(--secondary); }
  `;

    return (
        <StoreContext.Provider value={{ config }}>
            <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
}
