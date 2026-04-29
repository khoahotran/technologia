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
