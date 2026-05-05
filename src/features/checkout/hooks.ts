import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getAddresses, createAddress, getDefaultPaymentAccounts, setDefaultAddress, setDefaultPaymentAccount } from './api';
import type { CreateAddress } from './types';

import { checkoutKeys } from '@/constants/query-keys';
import { toErrorMessage } from '@/utils/error-message';

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
            toast.error(toErrorMessage(error, 'Failed to create address'));
        }
    });
}

export function useDefaultPaymentAccounts() {
    return useQuery({
        queryKey: [...checkoutKeys.all, 'payment-accounts', 'default'],
        queryFn: getDefaultPaymentAccounts,
    });
}

export function useSetDefaultAddress() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => setDefaultAddress(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: checkoutKeys.addresses() });
            toast.success('Default address updated');
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, 'Failed to update default address'));
        }
    });
}

export function useSetDefaultPaymentAccount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => setDefaultPaymentAccount(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...checkoutKeys.all, 'payment-accounts'] });
            toast.success('Default payment account updated');
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, 'Failed to update default payment account'));
        }
    });
}
