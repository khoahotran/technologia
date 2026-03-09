import { useQuery, keepPreviousData } from '@tanstack/react-query';

import { getProducts, getProductById, getBrands, getCategories } from './api';
import type { ProductSearchParams } from './types';

import { productKeys } from '@/constants/query-keys';

/**
 * Hook to fetch products with pagination/filters
 */
export function useProducts(params: ProductSearchParams = {}) {
    return useQuery({
        queryKey: productKeys.list(params as Record<string, unknown>),
        queryFn: () => getProducts(params),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5, // 5 mins
    });
}

/**
 * Hook to fetch a single product by ID
 */
export function useProductDetail(id: string | number | undefined) {
    return useQuery({
        queryKey: productKeys.detail(id || ''),
        queryFn: () => getProductById(id!),
        enabled: !!id,
        staleTime: 1000 * 60 * 10, // 10 mins
    });
}

/**
 * Hook to fetch all brands
 */
export function useBrands() {
    return useQuery({
        queryKey: ['brands'],
        queryFn: getBrands,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

/**
 * Hook to fetch all categories
 */
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}
