import { del, get, post, put } from "@/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import type {
    CreateDiscountRequest,
    DiscountListResponse,
    DiscountResponse,
    DiscountPagedParams,
    UpdateProductDiscountRequest,
} from "./admin-types";

function sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
            clean[key] = value;
        }
    }
    return clean;
}

export async function getDiscountsPaged(params: DiscountPagedParams = {}): Promise<DiscountListResponse> {
    const response = await get<PaginatedResponse<DiscountResponse>>("/api/discounts/paged", {
        params: sanitizeParams(params as Record<string, unknown>),
    });

    return {
        items: response.data || [],
        pageNumber: response.page_number ?? 0,
        pageSize: response.page_size ?? 10,
        totalItems: response.count_items ?? 0,
        totalPages: response.count_pages ?? 0,
    };
}

export async function getDiscountById(discountId: string): Promise<DiscountResponse> {
    const response = await get<ApiResponse<DiscountResponse>>(`/api/discounts/${discountId}`);
    return response.data;
}

export async function getAllDiscountsForAdmin(): Promise<DiscountResponse[]> {
    const response = await get<ApiResponse<DiscountResponse[]>>("/api/discounts");
    return response.data || [];
}

export async function createDiscountAdmin(payload: CreateDiscountRequest): Promise<DiscountResponse> {
    const response = await post<ApiResponse<DiscountResponse>>("/api/discounts/admin", payload);
    return response.data;
}

export async function updateDiscountAdmin(discountId: string, payload: CreateDiscountRequest): Promise<DiscountResponse> {
    const response = await put<ApiResponse<DiscountResponse>>(`/api/discounts/admin/${discountId}`, payload);
    return response.data;
}

export async function deleteDiscountAdmin(discountId: string): Promise<void> {
    await del<ApiResponse<null>>(`/api/discounts/admin/${discountId}`);
}

export async function applyProductsToDiscountAdmin(
    discountId: string,
    payload: UpdateProductDiscountRequest
): Promise<void> {
    await put<ApiResponse<unknown>>(`/api/discounts/admin/${discountId}/apply-products`, payload);
}
