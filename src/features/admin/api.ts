import type {
    AdminActionLogListResponse,
    AdminActionLogQueryParams,
    AdminActionLogResponse,
    CreateDeliveryLogRequest,
    CreateReportRequest,
    CreateReportResponse,
    DeliveryLogResponse,
    MonthlyProductRevenueEvent,
    MonthlyRevenueQueryParams,
    MonthlyRevenueResponse,
    ReportListResponse,
    ReportQueryParams,
    ReportResponse,
    TopSellingProductResponse,
    UpdateOrderDeliveryStatusRequest,
} from "./types";

import { del, get, patch, post, put } from "@/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import { formatParamsWithDates } from "@/utils";

// ─── Report Queries ──────────────────────────────────────────────────────────

/**
 * GET /api/orchestration/admin/report-details/monthly-revenue?from=YYYY-MM&to=YYYY-MM
 * Returns revenue per month for the given range.
 */
export async function getMonthlyRevenue(
    params: MonthlyRevenueQueryParams
): Promise<MonthlyRevenueResponse[]> {
    const response = await get<ApiResponse<MonthlyRevenueResponse[]>>(
        "/api/orchestration/admin/report-details/monthly-revenue",
        { params }
    );
    return response.data ?? [];
}

/**
 * GET /api/orchestration/admin/report-details/product-revenue?month=YYYY-MM
 * Returns product-level revenue breakdown for a single month.
 */
export async function getProductRevenueOfMonth(
    month: string
): Promise<MonthlyProductRevenueEvent> {
    const response = await get<ApiResponse<MonthlyProductRevenueEvent>>(
        "/api/orchestration/admin/report-details/product-revenue",
        { params: { month } }
    );
    return response.data;
}

/**
 * GET /api/orchestration/admin/report-details/top-selling-products?limit=N
 * Returns the top N selling products (all-time or recent).
 */
export async function getTopSellingProducts(
    limit = 10
): Promise<TopSellingProductResponse[]> {
    const response = await get<ApiResponse<TopSellingProductResponse[]>>(
        "/api/orchestration/admin/report-details/top-selling-products" + `/${limit}`
        // { params: { limit } }
    );
    return response.data ?? [];
}

// ─── Report Commands ─────────────────────────────────────────────────────────

/**
 * POST /api/orchestration/admin/report-details/create-report?from=YYYY-MM&to=YYYY-MM
 * Async — returns a reportId immediately; the PDF is generated in the background.
 * Poll GET /api/admins/reports/:reportId to check when it's ready (link is set).
 */
export async function createReport(
    payload: CreateReportRequest
): Promise<CreateReportResponse> {
    const response = await post<ApiResponse<CreateReportResponse>>(
        "/api/orchestration/admin/report-details/create-report",
        undefined,
        { params: { from: payload.from, to: payload.to } }
    );
    return response.data;
}

// ─── Report List (admin-service) ─────────────────────────────────────────────

export async function getReportById(reportId: string): Promise<ReportResponse> {
    const response = await get<ApiResponse<ReportResponse>>(`/api/admins/reports/${reportId}`);
    return response.data;
}

export async function getReports(params: ReportQueryParams = {}): Promise<ReportListResponse> {
    const response = await get<PaginatedResponse<ReportResponse>>("/api/admins/reports", {
        params: formatParamsWithDates(params),
    });
    return {
        items: response.data ?? [],
        pageNumber: response.page_number ?? 0,
        pageSize: response.page_size ?? 10,
        totalItems: response.count_items ?? 0,
        totalPages: response.count_pages ?? 0,
    };
}

// ─── Action Logs ──────────────────────────────────────────────────────────────

export async function getAdminActionLogs(
    params: AdminActionLogQueryParams = {}
): Promise<AdminActionLogListResponse> {
    const response = await get<PaginatedResponse<AdminActionLogResponse>>("/api/admins/action-logs/filter", {
        params: formatParamsWithDates(params),
    });
    return {
        items: response.data ?? [],
        pageNumber: response.page_number ?? 0,
        pageSize: response.page_size ?? 10,
        totalItems: response.count_items ?? 0,
        totalPages: response.count_pages ?? 0,
    };
}

export async function getAdminActionLogById(logId: string): Promise<AdminActionLogResponse> {
    const response = await get<ApiResponse<AdminActionLogResponse>>(`/api/admins/action-logs/by-id/${logId}`);
    return response.data;
}

// ─── Delivery Logs ────────────────────────────────────────────────────────────

export async function getDeliveryLogs(orderId: string): Promise<DeliveryLogResponse[]> {
    const response = await get<ApiResponse<DeliveryLogResponse[]>>(`/api/delivery-logs/order/${orderId}`);
    return response.data;
}

export async function getLatestDeliveryLog(orderId: string): Promise<DeliveryLogResponse | null> {
    const response = await get<ApiResponse<DeliveryLogResponse>>(`/api/delivery-logs/latest/${orderId}`);
    return response.data ?? null;
}

export async function createDeliveryLog(orderId: string, payload: CreateDeliveryLogRequest): Promise<DeliveryLogResponse> {
    const response = await post<ApiResponse<DeliveryLogResponse>>(`/api/orders/admin/${orderId}/create-delivery-log`, payload);
    return response.data;
}

export async function updateDeliveryLog(deliveryLogId: string, payload: CreateDeliveryLogRequest): Promise<DeliveryLogResponse> {
    const response = await put<ApiResponse<DeliveryLogResponse>>(`/api/orders/admin/${deliveryLogId}/update-delivery-log`, payload);
    return response.data;
}

export async function deleteDeliveryLog(deliveryLogId: string): Promise<void> {
    await del<ApiResponse<null>>(`/api/orders/admin/${deliveryLogId}/delete-delivery-log`);
}

export async function updateOrderDeliveryStatus(orderId: string, payload: UpdateOrderDeliveryStatusRequest): Promise<void> {
    await patch(`/api/orders/admin/${orderId}/status`, { newStatus: payload.deliveryStatus });
}
