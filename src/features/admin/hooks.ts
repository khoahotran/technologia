import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    createMonthlyRevenueReport,
    createTopSellingProductsReport,
    getReportById,
    getReports,
} from "./api";
import type {
    CreateMonthlyRevenueReportRequest,
    CreateTopSellingProductsReportRequest,
    ReportQueryParams,
} from "./types";

import { toErrorMessage } from "@/utils/error-message";

const adminReportKeys = {
    all: ["admin", "reports"] as const,
    list: (params: ReportQueryParams) => ["admin", "reports", params] as const,
    detail: (id: string) => ["admin", "reports", "detail", id] as const,
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

export function useCreateMonthlyRevenueReport() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateMonthlyRevenueReportRequest) => createMonthlyRevenueReport(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminReportKeys.all });
            toast.success("Monthly revenue report created");
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, "Failed to create monthly revenue report"));
        },
    });
}

export function useCreateTopSellingProductsReport() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateTopSellingProductsReportRequest) =>
            createTopSellingProductsReport(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminReportKeys.all });
            toast.success("Top selling products report created");
        },
        onError: (error: unknown) => {
            toast.error(toErrorMessage(error, "Failed to create top selling products report"));
        },
    });
}
