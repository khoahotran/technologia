import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    applyProductsToDiscountAdmin,
    createDiscountAdmin,
    deleteDiscountAdmin,
    getDiscountsPaged,
    updateDiscountAdmin,
} from "./admin-api";
import type {
    CreateDiscountRequest,
    DiscountPagedParams,
    UpdateProductDiscountRequest,
} from "./admin-types";

import { useLanguage } from "@/providers/language.provider";
import { toErrorMessage } from "@/utils/error-message";

const DISCOUNT_KEYS = {
    all: ["discounts"] as const,
    paged: (params: DiscountPagedParams) => ["discounts", "paged", params] as const,
};

export function useDiscountsPaged(params: DiscountPagedParams) {
    return useQuery({
        queryKey: DISCOUNT_KEYS.paged(params),
        queryFn: () => getDiscountsPaged(params),
    });
}

export function useCreateDiscountAdmin() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: (payload: CreateDiscountRequest) => createDiscountAdmin(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DISCOUNT_KEYS.all });
            toast.success(t("admin_discount_created_success", {}, "Discount created successfully"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, "admin_failed_create_discount")));
        },
    });
}

export function useUpdateDiscountAdmin() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: ({ discountId, payload }: { discountId: string; payload: CreateDiscountRequest }) =>
            updateDiscountAdmin(discountId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DISCOUNT_KEYS.all });
            toast.success(t("admin_discount_updated_success", {}, "Discount updated successfully"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, "admin_failed_update_discount")));
        },
    });
}

export function useDeleteDiscountAdmin() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: (discountId: string) => deleteDiscountAdmin(discountId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DISCOUNT_KEYS.all });
            toast.success(t("admin_discount_deleted_success", {}, "Discount deleted successfully"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, "admin_failed_delete_discount")));
        },
    });
}

export function useApplyProductsToDiscountAdmin() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: ({ discountId, payload }: { discountId: string; payload: UpdateProductDiscountRequest }) =>
            applyProductsToDiscountAdmin(discountId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DISCOUNT_KEYS.all });
            toast.success(t("admin_discount_applied_success", {}, "Products applied to discount successfully"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, "admin_failed_apply_discount")));
        },
    });
}
