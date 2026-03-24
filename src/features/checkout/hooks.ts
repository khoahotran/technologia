import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getAddresses, createAddress, getDefaultPaymentAccounts } from './api';
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
