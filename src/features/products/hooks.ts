import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    addProductVariantAdmin,
    addVariantImageAdmin,
    applyProductsToDiscountAdmin,
    createBrandAdmin,
    createCategoryAdmin,
    createProductAdmin,
    deleteBrandAdmin,
    deleteCategoryAdmin,
    deleteProductAdmin,
    deleteProductVariantAdmin,
    getBrands,
    getCategories,
    getProductById,
    getProducts,
    updateBrandAdmin,
    updateCategoryAdmin,
    updateProductAdmin,
    updateProductVariantAdmin,
} from "./api";
import type {
    CreateBrandRequest,
    CreateCategoryRequest,
    CreateProductRequest,
    CreateProductVariantRequest,
    ProductSearchParams,
    UpdateProductRequest,
    UpdateProductVariantRequest,
} from "./types";

import { productKeys } from "@/constants/query-keys";
import { useLanguage } from "@/providers/language.provider";
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
    const { t } = useLanguage();
    return useMutation({
        mutationFn: (payload: CreateBrandRequest) => createBrandAdmin(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["brands"] });
            toast.success(t('admin_brand_created_success', {}, "Brand created successfully"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'admin_failed_create_brand')));
        },
    });
}

export function useUpdateBrandAdmin() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    return useMutation({
        mutationFn: ({ brandId, payload }: { brandId: number | string; payload: CreateBrandRequest }) =>
            updateBrandAdmin(brandId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["brands"] });
            toast.success(t('admin_brand_updated_success', {}, "Brand updated successfully"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'admin_failed_update_brand')));
        },
    });
}

export function useDeleteBrandAdmin() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    return useMutation({
        mutationFn: (brandId: number | string) => deleteBrandAdmin(brandId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["brands"] });
            toast.success(t('admin_brand_deleted_success', {}, "Brand deleted successfully"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'admin_failed_delete_brand')));
        },
    });
}

export function useCreateCategoryAdmin() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    return useMutation({
        mutationFn: (payload: CreateCategoryRequest) => createCategoryAdmin(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success(t('admin_category_created_success', {}, "Category created successfully"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'admin_failed_create_category')));
        },
    });
}

export function useUpdateCategoryAdmin() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    return useMutation({
        mutationFn: ({ categoryId, payload }: { categoryId: number | string; payload: CreateCategoryRequest }) =>
            updateCategoryAdmin(categoryId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success(t('admin_category_updated_success', {}, "Category updated successfully"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'admin_failed_update_category')));
        },
    });
}

export function useDeleteCategoryAdmin() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    return useMutation({
        mutationFn: (categoryId: number | string) => deleteCategoryAdmin(categoryId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success(t('admin_category_deleted_success', {}, "Category deleted successfully"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'admin_failed_delete_category')));
        },
    });
}

export function useCreateProductAdmin() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    return useMutation({
        mutationFn: (payload: CreateProductRequest) => createProductAdmin(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            toast.success(t('admin_product_created_success', {}, "Product created successfully"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'admin_failed_create_product')));
        },
    });
}

export function useUpdateProductAdmin() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    return useMutation({
        mutationFn: ({ productId, payload }: { productId: string; payload: UpdateProductRequest }) =>
            updateProductAdmin(productId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            toast.success(t('admin_product_updated_success', {}, "Product updated successfully"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'admin_failed_update_product')));
        },
    });
}

export function useDeleteProductAdmin() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    return useMutation({
        mutationFn: (productId: string) => deleteProductAdmin(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            toast.success(t('admin_product_deleted_success', {}, "Product deleted successfully"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'admin_failed_delete_product')));
        },
    });
}

export function useAddProductVariantAdmin() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    return useMutation({
        mutationFn: ({ productId, payload }: { productId: string; payload: CreateProductVariantRequest }) =>
            addProductVariantAdmin(productId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            toast.success(t('admin_product_variant_added_success', {}, "Product variant added successfully"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'admin_failed_add_variant')));
        },
    });
}

export function useUpdateProductVariantAdmin() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    return useMutation({
        mutationFn: ({ productId, variantId, payload }: { productId: string; variantId: string; payload: UpdateProductVariantRequest }) =>
            updateProductVariantAdmin(productId, variantId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            toast.success(t('admin_variant_updated_success', {}, "Variant updated successfully"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'admin_failed_update_variant')));
        },
    });
}

export function useDeleteProductVariantAdmin() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    return useMutation({
        mutationFn: ({ productId, variantId }: { productId: string; variantId: string }) =>
            deleteProductVariantAdmin(productId, variantId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            toast.success(t('admin_variant_deleted_success', {}, "Variant deleted successfully"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'admin_failed_delete_variant')));
        },
    });
}

export function useApplyProductsToDiscountAdmin() {
    const { t } = useLanguage();
    return useMutation({
        mutationFn: (input: { discountId: string } & import("./types").ApplyProductsToDiscountRequest) => {
            const payload: import("./types").ApplyProductsToDiscountRequest = {};
            if (input.brandIds) payload.brandIds = input.brandIds;
            if (input.categoryIds) payload.categoryIds = input.categoryIds;
            if (input.productVariantIds) payload.productVariantIds = input.productVariantIds;
            return applyProductsToDiscountAdmin(input.discountId, payload);
        },
        onSuccess: () => {
            toast.success(t('admin_discount_applied_success', {}, "Discount applied successfully"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'admin_failed_apply_discount')));
        },
    });
}

export function useAddVariantImageAdmin() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    return useMutation({
        mutationFn: ({ productId, variantId, image }: { productId: string; variantId: string; image: File }) =>
            addVariantImageAdmin(productId, variantId, image),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            toast.success(t('admin_variant_image_uploaded_success', {}, "Variant image uploaded successfully"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'admin_failed_upload_image')));
        },
    });
}
