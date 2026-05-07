import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useLanguage } from "@/providers/language.provider";
import { toErrorMessage } from "@/utils/error-message";
import {
    createMonthlyRevenueReport,
    createTopSellingProductsReport,
    getAdminActionLogById,
    getAdminActionLogs,
    getReportById,
    getReports,
} from "./api";
import type {
    AdminActionLogQueryParams,
    CreateMonthlyRevenueReportRequest,
    CreateTopSellingProductsReportRequest,
    ReportQueryParams,
} from "./types";

const adminReportKeys = {
    all: ["admin", "reports"] as const,
    list: (params: ReportQueryParams) => ["admin", "reports", params] as const,
    detail: (id: string) => ["admin", "reports", "detail", id] as const,
    actionLogs: (params: AdminActionLogQueryParams) => ["admin", "action-logs", params] as const,
    actionLogDetail: (id: string) => ["admin", "action-logs", "detail", id] as const,
};

export function useAdminReports(params: ReportQueryParams) {
    return useQuery({
        queryKey: adminReportKeys.list(params),
        queryFn: () => getReports(params),
    });
}

export function useAdminReport(reportId: string, enabled = true) {
    return useQuery({
        queryKey: adminReportKeys.detail(reportId),
        queryFn: () => getReportById(reportId),
        enabled: Boolean(reportId) && enabled,
    });
}

export function useAdminActionLogs(params: AdminActionLogQueryParams) {
    return useQuery({
        queryKey: adminReportKeys.actionLogs(params),
        queryFn: () => getAdminActionLogs(params),
    });
}

export function useAdminActionLog(logId: string, enabled = true) {
    return useQuery({
        queryKey: adminReportKeys.actionLogDetail(logId),
        queryFn: () => getAdminActionLogById(logId),
        enabled: Boolean(logId) && enabled,
    });
}

export function useCreateMonthlyRevenueReport() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: (payload: CreateMonthlyRevenueReportRequest) => createMonthlyRevenueReport(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminReportKeys.all });
            toast.success(t('admin_monthly_revenue_success', {}, "Monthly revenue report created"));
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, t('admin_monthly_revenue_failed', {}, "Failed to create monthly revenue report")));
        },
    });
}

export function useCreateTopSellingProductsReport() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: (payload: CreateTopSellingProductsReportRequest) =>
            createTopSellingProductsReport(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminReportKeys.all });
            toast.success(t('admin_top_selling_success', {}, "Top selling products report created"));
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, t('admin_top_selling_failed', {}, "Failed to create top selling products report")));
        },
    });
}
