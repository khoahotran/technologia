import type {
    AdminActionLogListResponse,
    AdminActionLogQueryParams,
    AdminActionLogResponse,
    CreateDeliveryLogRequest,
    CreateMonthlyRevenueReportRequest,
    CreateTopSellingProductsReportRequest,
    DeliveryLogResponse,
    ReportListResponse,
    ReportQueryParams,
    ReportResponse,
    UpdateOrderDeliveryStatusRequest,
} from "./types";

import { del, get, patch, post, put } from "@/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";

export async function createMonthlyRevenueReport(
    payload: CreateMonthlyRevenueReportRequest
): Promise<ReportResponse> {
    const response = await post<ApiResponse<ReportResponse>>(
        "/api/admins/reports/monthly-revenue",
        payload
    );
    return response.data;
}

export async function createTopSellingProductsReport(
    payload: CreateTopSellingProductsReportRequest
): Promise<ReportResponse> {
    const response = await post<ApiResponse<ReportResponse>>(
        "/api/admins/reports/top-selling-products",
        payload
    );
    return response.data;
}

export async function getReportById(reportId: string): Promise<ReportResponse> {
    const response = await get<ApiResponse<ReportResponse>>(`/api/admins/reports/${reportId}`);
    return response.data;
}

export async function getReports(params: ReportQueryParams = {}): Promise<ReportListResponse> {
    const response = await get<PaginatedResponse<ReportResponse>>("/api/admins/reports", {
        params,
    });
    return {
        items: response.data ?? [],
        pageNumber: response.page_number ?? 0,
        pageSize: response.page_size ?? 10,
        totalItems: response.count_items ?? 0,
        totalPages: response.count_pages ?? 0,
    };
}

export async function getAdminActionLogs(
    params: AdminActionLogQueryParams = {}
): Promise<AdminActionLogListResponse> {
    const response = await get<PaginatedResponse<AdminActionLogResponse>>("/api/admins/action-logs/filter", {
        params,
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
