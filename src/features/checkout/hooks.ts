import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createAddress, createPaymentAccount, deletePaymentAccount, getAddresses, getAllPaymentAccounts, getDefaultPaymentAccounts, setDefaultAddress, setDefaultPaymentAccount } from './api';
import type { CreateAddress, CreatePaymentAccount } from './types';

import { checkoutKeys } from '@/constants/query-keys';
import { useLanguage } from '@/providers/language.provider';
import { toErrorMessage } from '@/utils/error-message';

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
            toast.error(t(toErrorMessage(error, 'failed_create_address')));
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
            toast.error(t(toErrorMessage(error, 'failed_update_default_address')));
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
            toast.error(t(toErrorMessage(error, 'failed_update_default_payment')));
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
            toast.error(t(toErrorMessage(error, 'failed_create_payment')));
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
            toast.error(t(toErrorMessage(error, 'failed_delete_payment')));
        }
    });
}
