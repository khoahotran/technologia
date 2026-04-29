import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    addProductVariantAdmin,
    applyProductsToDiscountAdmin,
    createBrandAdmin,
    createCategoryAdmin,
    createProductAdmin,
    deleteBrandAdmin,
    deleteCategoryAdmin,
    deleteProductAdmin,
    getBrands,
    getCategories,
    getProductById,
    getProducts,
    updateBrandAdmin,
    updateCategoryAdmin,
    updateProductAdmin,
} from "./api";
import type {
    CreateBrandRequest,
    CreateCategoryRequest,
    CreateProductRequest,
    CreateProductVariantRequest,
    ProductSearchParams,
    UpdateProductRequest,
} from "./types";

import { productKeys } from "@/constants/query-keys";
import { toErrorMessage } from "@/utils/error-message";

export function useProducts(params: ProductSearchParams = {}) {
    return useQuery({
        queryKey: productKeys.list(params as Record<string, unknown>),
        queryFn: () => getProducts(params),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5,
    });
}

export function useProductDetail(id: string | number | undefined) {
    return useQuery({
        queryKey: productKeys.detail(id || ""),
        queryFn: () => getProductById(id!),
        enabled: !!id,
        staleTime: 1000 * 60 * 10,
    });
}

export function useBrands() {
    return useQuery({
        queryKey: ["brands"],
        queryFn: getBrands,
        staleTime: 1000 * 60 * 60,
    });
}

export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
        staleTime: 1000 * 60 * 60,
    });
}

export function useCreateBrandAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateBrandRequest) => createBrandAdmin(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["brands"] });
            toast.success("Brand created successfully");
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, "Failed to create brand"));
        },
    });
}

export function useUpdateBrandAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ brandId, payload }: { brandId: number | string; payload: CreateBrandRequest }) =>
            updateBrandAdmin(brandId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["brands"] });
            toast.success("Brand updated successfully");
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, "Failed to update brand"));
        },
    });
}

export function useDeleteBrandAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (brandId: number | string) => deleteBrandAdmin(brandId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["brands"] });
            toast.success("Brand deleted successfully");
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, "Failed to delete brand"));
        },
    });
}

export function useCreateCategoryAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateCategoryRequest) => createCategoryAdmin(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Category created successfully");
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, "Failed to create category"));
        },
    });
}

export function useUpdateCategoryAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ categoryId, payload }: { categoryId: number | string; payload: CreateCategoryRequest }) =>
            updateCategoryAdmin(categoryId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Category updated successfully");
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, "Failed to update category"));
        },
    });
}

export function useDeleteCategoryAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (categoryId: number | string) => deleteCategoryAdmin(categoryId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Category deleted successfully");
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, "Failed to delete category"));
        },
    });
}

export function useCreateProductAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateProductRequest) => createProductAdmin(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            toast.success("Product created successfully");
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, "Failed to create product"));
        },
    });
}

export function useUpdateProductAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, payload }: { productId: string; payload: UpdateProductRequest }) =>
            updateProductAdmin(productId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            toast.success("Product updated successfully");
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, "Failed to update product"));
        },
    });
}

export function useDeleteProductAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (productId: string) => deleteProductAdmin(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            toast.success("Product deleted successfully");
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, "Failed to delete product"));
        },
    });
}

export function useAddProductVariantAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, payload }: { productId: string; payload: CreateProductVariantRequest }) =>
            addProductVariantAdmin(productId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            toast.success("Product variant added successfully");
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, "Failed to add product variant"));
        },
    });
}

export function useApplyProductsToDiscountAdmin() {
    return useMutation({
        mutationFn: ({ discountId, productIds }: { discountId: string; productIds: string[] }) =>
            applyProductsToDiscountAdmin(discountId, { productIds }),
        onSuccess: () => {
            toast.success("Discount applied successfully");
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, "Failed to apply discount"));
        },
    });
}
