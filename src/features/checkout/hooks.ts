import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getAddresses, createAddress, placeOrder, getOrders, getOrderById } from './api';
import type { CreateAddress } from './types';

export const checkoutKeys = {
    all: ['checkout'] as const,
    addresses: () => [...checkoutKeys.all, 'addresses'] as const,
    orders: () => [...checkoutKeys.all, 'orders'] as const,
    order: (id: string) => [...checkoutKeys.orders(), id] as const,
};

export function useAddresses() {
    return useQuery({
        queryKey: checkoutKeys.addresses(),
        queryFn: getAddresses,
    });
}

export function useCreateAddress() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateAddress) => createAddress(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: checkoutKeys.addresses() });
            toast.success('Address created successfully');
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'Failed to create address';
            toast.error(message);
        }
    });
}

export function usePlaceOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Record<string, unknown>) => placeOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: checkoutKeys.orders() });
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success('Order placed successfully');
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'Failed to place order';
            toast.error(message);
        }
    });
}

export function useOrders() {
    return useQuery({
        queryKey: checkoutKeys.orders(),
        queryFn: getOrders,
    });
}

export function useOrder(id: string) {
    return useQuery({
        queryKey: checkoutKeys.order(id),
        queryFn: () => getOrderById(id),
        enabled: Boolean(id),
    });
}
