import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { checkoutKeys } from '@/constants/query-keys';
import { useLanguage } from '@/providers/language.provider';
import { toErrorMessage } from '@/utils/error-message';
import { createAddress, createPaymentAccount, deletePaymentAccount, getAddresses, getAllPaymentAccounts, getDefaultPaymentAccounts, setDefaultAddress, setDefaultPaymentAccount } from './api';
import type { CreateAddress, CreatePaymentAccount } from './types';

export function useAddresses() {
    return useQuery({
        queryKey: checkoutKeys.addresses(),
        queryFn: getAddresses,
    });
}

export function useCreateAddress() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    return useMutation({
        mutationFn: (data: CreateAddress) => createAddress(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: checkoutKeys.addresses() });
            toast.success(t('address_created_success', {}, 'Address created successfully'));
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, t('failed_create_address', {}, 'Failed to create address')));
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
    const { t } = useLanguage();
    return useMutation({
        mutationFn: (id: string) => setDefaultAddress(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: checkoutKeys.addresses() });
            toast.success(t('default_address_updated', {}, 'Default address updated'));
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, t('failed_update_default_address', {}, 'Failed to update default address')));
        }
    });
}

export function useSetDefaultPaymentAccount() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    return useMutation({
        mutationFn: (id: string) => setDefaultPaymentAccount(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...checkoutKeys.all, 'payment-accounts'] });
            toast.success(t('default_payment_account_updated', {}, 'Default payment account updated'));
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, t('failed_update_default_payment', {}, 'Failed to update default payment account')));
        }
    });
}

export function usePaymentAccounts() {
    return useQuery({
        queryKey: [...checkoutKeys.all, 'payment-accounts'],
        queryFn: getAllPaymentAccounts,
    });
}

export function useCreatePaymentAccount() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    return useMutation({
        mutationFn: (data: CreatePaymentAccount) => createPaymentAccount(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...checkoutKeys.all, 'payment-accounts'] });
            toast.success(t('payment_account_created_success', {}, 'Payment account created successfully'));
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, t('failed_create_payment', {}, 'Failed to create payment account')));
        }
    });
}

export function useDeletePaymentAccount() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    return useMutation({
        mutationFn: (id: string) => deletePaymentAccount(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...checkoutKeys.all, 'payment-accounts'] });
            toast.success(t('payment_account_deleted_success', {}, 'Payment account deleted successfully'));
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, t('failed_delete_payment', {}, 'Failed to delete payment account')));
        }
    });
}
