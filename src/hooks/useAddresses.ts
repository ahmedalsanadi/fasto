import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeService } from '@/services/store-service';
import type {
    CreateAddressRequest,
    UpdateAddressRequest,
    Address,
} from '@/types/address';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export const addressKeys = {
    all: ['addresses'] as const,
    lists: () => [...addressKeys.all, 'list'] as const,
    list: (params: any) => [...addressKeys.lists(), params] as const,
    details: () => [...addressKeys.all, 'detail'] as const,
    detail: (id: number) => [...addressKeys.details(), id] as const,
};

export function useAddresses(params?: { default?: boolean; label?: string }) {
    const { isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: addressKeys.list(params || {}),
        queryFn: () => storeService.getAddresses(params),
        enabled: isAuthenticated,
    });
}

export function useAddress(id: number | null) {
    const { isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: addressKeys.detail(id as number),
        queryFn: () => storeService.getAddress(id as number),
        enabled: isAuthenticated && !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useCreateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAddressRequest) =>
            storeService.createAddress(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: addressKeys.all });
        },
    });
}

export function useUpdateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: UpdateAddressRequest;
        }) => storeService.updateAddress(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: addressKeys.all });
            queryClient.invalidateQueries({
                queryKey: addressKeys.detail(variables.id),
            });
        },
    });
}

export function useDeleteAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => storeService.deleteAddress(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: addressKeys.all });
        },
    });
}

// Location Hooks
export function useCountries() {
    return useQuery({
        queryKey: ['countries'],
        queryFn: () => storeService.getCountries(),
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
    });
}

export function useCities(countryId: number | null) {
    return useQuery({
        queryKey: ['cities', countryId],
        queryFn: () => storeService.getCities(countryId as number),
        enabled: !!countryId,
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
    });
}

export function useDistricts(cityId: number | null) {
    return useQuery({
        queryKey: ['districts', cityId],
        queryFn: () => storeService.getDistricts(cityId as number),
        enabled: !!cityId,
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
    });
}
