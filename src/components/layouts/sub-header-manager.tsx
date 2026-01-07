'use client';

import { useEffect } from 'react';
import { useUiStore } from '@/store/use-ui-store';

export default function SubHeaderManager({ show }: { show: boolean }) {
    const { setShowSubHeader } = useUiStore();

    useEffect(() => {
        setShowSubHeader(show);
    }, [show, setShowSubHeader]);

    return null;
}
