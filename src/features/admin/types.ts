export type ReportType = "MONTHLY_REVENUE" | "TOP_SELLING_PRODUCTS";

export interface MonthlyRevenueItem {
    month:
        | "JANUARY"
        | "FEBRUARY"
        | "MARCH"
        | "APRIL"
        | "MAY"
        | "JUNE"
        | "JULY"
        | "AUGUST"
        | "SEPTEMBER"
        | "OCTOBER"
        | "NOVEMBER"
        | "DECEMBER";
    revenue: number;
}

export interface CreateMonthlyRevenueReportRequest {
    reportItems: MonthlyRevenueItem[];
}

export interface TopSellingProductItem {
    productId: string;
    productName: string;
    totalSold: number;
}

export interface CreateTopSellingProductsReportRequest {
    reportItems: TopSellingProductItem[];
}

export interface ReportResponse {
    reportId: string;
    adminId: string;
    reportType: ReportType;
    name: string;
    link: string;
    createdAt: string;
}

export interface ReportQueryParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: "ASC" | "DESC";
    fromDate?: string;
    toDate?: string;
    reportType?: ReportType;
}

export interface ReportListResponse {
    items: ReportResponse[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface AdminActionLogResponse {
    adminActionLogId: string;
    adminId: string;
    action: string;
    note: string;
    createdAt: string;
    entityType: string;
}

export interface AdminActionLogQueryParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: "ASC" | "DESC";
    adminId?: string;
    action?: string;
    fromDate?: string;
    toDate?: string;
}

export interface AdminActionLogListResponse {
    items: AdminActionLogResponse[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface DeliveryLogResponse {
    deliveryLogId: string;
    orderId: string;
    status: string;
    message: string;
    createdAt: string;
}

export interface CreateDeliveryLogRequest {
    stepStatus: string;
    message: string;
}

export interface UpdateOrderDeliveryStatusRequest {
    deliveryStatus: string;
}
