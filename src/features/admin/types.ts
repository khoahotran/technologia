// Report types — backend only supports MONTHLY_REVENUE now
export type ReportType = "MONTHLY_REVENUE";

// ─── Revenue ───────────────────────────────────────────────────────────────

/** Revenue per month returned by GET /orchestration/report-details/monthly-revenue */
export interface MonthlyRevenueResponse {
    month: string;   // "YYYY-MM"
    revenue: number;
}

/** Query params for monthly-revenue endpoint */
export interface MonthlyRevenueQueryParams {
    from: string;  // "YYYY-MM"
    to: string;    // "YYYY-MM"
}

// ─── Product Revenue ────────────────────────────────────────────────────────

/** Single product line in a month's revenue breakdown */
export interface ProductRevenueItem {
    productId: string;
    variantId: string;
    productName: string;
    color: string;
    storage: string;
    quantitySold: number;
    revenue: number;
}

/** Product revenue data for one month */
export interface MonthlyProductRevenueEvent {
    time: string;          // "YYYY-MM"
    totalRevenue: number;
    products: ProductRevenueItem[];
}

// ─── Top Selling ────────────────────────────────────────────────────────────

export interface TopSellingProductResponse {
    productId: string;
    productName: string;
    totalSold: number;
    totalRevenue: number;
    /** may be absent in some backend versions */
    imageUrl?: string;
}

// ─── Create Report (async) ──────────────────────────────────────────────────

/** POST /orchestration/admin/report-details/create-report?from=&to= */
export interface CreateReportRequest {
    from: string;  // "YYYY-MM"
    to: string;    // "YYYY-MM"
}

/** Immediately returned — report is generated asynchronously */
export interface CreateReportResponse {
    reportId: string;
}

// ─── Report list ────────────────────────────────────────────────────────────

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
    fromDate?: string | undefined;
    toDate?: string | undefined;
    reportType?: ReportType | undefined;
}

export interface ReportListResponse {
    items: ReportResponse[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

// ─── Action Logs ────────────────────────────────────────────────────────────

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
    adminId?: string | undefined;
    action?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}

export interface AdminActionLogListResponse {
    items: AdminActionLogResponse[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

// ─── Delivery Logs ──────────────────────────────────────────────────────────

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
