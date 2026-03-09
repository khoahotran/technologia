import type { Address, CreateAddress, Order } from './types';

import { get, post, del } from '@/api/client';
import type { ApiResponse } from '@/types/api.types';

/**
 * Address API
 */
export async function getAddresses(): Promise<Address[]> {
    const response = await get<ApiResponse<Address[]>>('/api/addresses');
    return response.data || [];
}

export async function getAddressById(id: string): Promise<Address> {
    const response = await get<ApiResponse<Address>>(`/api/addresses/${id}`);
    return response.data;
}

export async function createAddress(data: CreateAddress): Promise<Address> {
    const response = await post<ApiResponse<Address>>('/api/addresses', data);
    return response.data;
}

export async function deleteAddress(id: string): Promise<void> {
    await del(`/api/addresses/${id}`);
}

/**
 * Order API
 */
export async function placeOrder(orderData: Record<string, unknown>): Promise<Order> {
    const response = await post<ApiResponse<Order>>('/api/orders', orderData);
    return response.data;
}

export async function getOrders(): Promise<Order[]> {
    const response = await get<ApiResponse<Order[]>>('/api/orders/paged');
    return response.data || [];
}

export async function getOrderById(id: string): Promise<Order> {
    const response = await get<ApiResponse<Order>>(`/api/orders/${id}`);
    return response.data;
}
