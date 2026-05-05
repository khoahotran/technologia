import type { Address, CreateAddress, PaymentAccountResponse } from './types';
import { AddressSchema, PaymentAccountResponseSchema } from './types';

import { get, post, del, patch } from '@/api/client';
import type { ApiResponse } from '@/types/api.types';

/**
 * Address API
 */
export async function getAddresses(): Promise<Address[]> {
    const response = await get<Address[]>('/api/addresses');
    return response.map((item) => AddressSchema.parse(item));
}

export async function getAddressById(id: string): Promise<Address> {
    const response = await get<ApiResponse<Address>>(`/api/addresses/${id}`);
    return AddressSchema.parse(response.data);
}

export async function createAddress(data: CreateAddress): Promise<Address> {
    const response = await post<ApiResponse<Address>>('/api/addresses', data);
    return AddressSchema.parse(response.data);
}

export async function deleteAddress(id: string): Promise<void> {
    await del(`/api/addresses/${id}`);
}

export async function getDefaultPaymentAccounts(): Promise<PaymentAccountResponse[]> {
    const response = await get<PaymentAccountResponse[]>('/api/payment-accounts/default');
    return response.map((item) => PaymentAccountResponseSchema.parse(item));
}

export async function setDefaultAddress(id: string): Promise<Address> {
    const response = await patch<ApiResponse<Address>>(`/api/addresses/set-default/${id}`);
    return AddressSchema.parse(response.data);
}

export async function setDefaultPaymentAccount(id: string): Promise<PaymentAccountResponse> {
    const response = await patch<ApiResponse<PaymentAccountResponse>>(`/api/payment-accounts/set-default/${id}`);
    return PaymentAccountResponseSchema.parse(response.data);
}
