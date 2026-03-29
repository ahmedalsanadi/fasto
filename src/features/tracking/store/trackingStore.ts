import { create } from 'zustand';

export interface DriverLocationState {
    latitude: number;
    longitude: number;
    heading: number | null;
    speed: number | null;
    updatedAt: string | null;
}

interface TrackingStoreState {
    activeOrderId: number | null;
    driverLocation: DriverLocationState | null;
    setSession: (orderId: number) => void;
    clearSession: () => void;
    setDriverLocation: (location: DriverLocationState | null) => void;
}

export const useTrackingStore = create<TrackingStoreState>((set) => ({
    activeOrderId: null,
    driverLocation: null,
    setSession: (orderId) =>
        set({ activeOrderId: orderId, driverLocation: null }),
    clearSession: () => set({ activeOrderId: null, driverLocation: null }),
    setDriverLocation: (driverLocation) => set({ driverLocation }),
}));
