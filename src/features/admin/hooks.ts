import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

import {
    createDeliveryLog,
    createReport,
    deleteDeliveryLog,
    getAdminActionLogById,
    getAdminActionLogs,
    getDeliveryLogs,
    getLatestDeliveryLog,
    getMonthlyRevenue,
    getProductRevenueOfMonth,
    getReportById,
    getReports,
    getTopSellingProducts,
    updateDeliveryLog,
    updateOrderDeliveryStatus,
} from "./api";
import type {
    AdminActionLogQueryParams,
    CreateDeliveryLogRequest,
    CreateReportRequest,
    MonthlyRevenueQueryParams,
    ReportQueryParams,
    UpdateOrderDeliveryStatusRequest,
} from "./types";

import { checkoutKeys } from "@/constants/query-keys";
import { useLanguage } from "@/providers/language.provider";
import { toErrorMessage } from "@/utils/error-message";

// ─── Query Keys ───────────────────────────────────────────────────────────────

const adminReportKeys = {
    all: ["admin", "reports"] as const,
    list: (params: ReportQueryParams) => ["admin", "reports", params] as const,
    detail: (id: string) => ["admin", "reports", "detail", id] as const,
    actionLogs: (params: AdminActionLogQueryParams) => ["admin", "action-logs", params] as const,
    actionLogDetail: (id: string) => ["admin", "action-logs", "detail", id] as const,
    monthlyRevenue: (params: MonthlyRevenueQueryParams) => ["admin", "monthly-revenue", params] as const,
    productRevenue: (month: string) => ["admin", "product-revenue", month] as const,
    topSelling: (limit: number) => ["admin", "top-selling", limit] as const,
};

// ─── Report List ──────────────────────────────────────────────────────────────

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

// ─── Revenue Queries ──────────────────────────────────────────────────────────

/** Fetch monthly revenue for a date range (from/to as "YYYY-MM"). */
export function useMonthlyRevenue(params: MonthlyRevenueQueryParams, enabled = true) {
    return useQuery({
        queryKey: adminReportKeys.monthlyRevenue(params),
        queryFn: () => getMonthlyRevenue(params),
        enabled: enabled && Boolean(params.from) && Boolean(params.to),
        staleTime: 5 * 60 * 1000, // 5 min — revenue data doesn't change often
    });
}

/** Fetch per-product revenue breakdown for a single month. Lazy by default (enabled=false). */
export function useProductRevenueOfMonth(month: string, enabled = false) {
    return useQuery({
        queryKey: adminReportKeys.productRevenue(month),
        queryFn: () => getProductRevenueOfMonth(month),
        enabled: enabled && Boolean(month),
        staleTime: 5 * 60 * 1000,
    });
}

/** Fetch top-N selling products from the backend. */
export function useTopSellingProducts(limit = 10, enabled = true) {
    return useQuery({
        queryKey: adminReportKeys.topSelling(limit),
        queryFn: () => getTopSellingProducts(limit),
        enabled,
        staleTime: 5 * 60 * 1000,
    });
}

// ─── Report Creation (async) ──────────────────────────────────────────────────

/**
 * Poll GET /api/admins/reports/:reportId every 10 s until the `link` field is
 * populated (meaning the PDF is ready) or until maxAttempts is reached.
 */
function usePollReportReady() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useCallback(
        async (reportId: string, maxAttempts = 18 /* 18 × 10 s = 3 min */) => {
            let attempts = 0;
            while (attempts < maxAttempts) {
                await new Promise((r) => setTimeout(r, 10_000));
                try {
                    const report = await getReportById(reportId);
                    if (report?.link) {
                        queryClient.invalidateQueries({ queryKey: adminReportKeys.all });
                        toast.success(t("admin_report_ready", {}, "Report is ready! Check the list below."));
                        return report;
                    }
                } catch {
                    // report not saved yet — continue polling
                }
                attempts++;
            }
            // timed out
            toast.info(
                t(
                    "admin_report_processing",
                    {},
                    "Report is being processed. Please refresh the list in a few minutes."
                )
            );
            return null;
        },
        [queryClient, t]
    );
}

/** Mutation: create report async. Polls every 10 s once reportId is returned. */
export function useCreateReport() {
    const { t } = useLanguage();
    const pollReportReady = usePollReportReady();

    return useMutation({
        mutationFn: (payload: CreateReportRequest) => createReport(payload),
        onSuccess: ({ reportId }) => {
            toast.loading(
                t(
                    "admin_report_generating",
                    {},
                    "Generating report… This may take a moment."
                ),
                { id: `report-${reportId}`, duration: Infinity }
            );
            // fire-and-forget polling — toast is updated inside pollReportReady
            pollReportReady(reportId).then(() => {
                toast.dismiss(`report-${reportId}`);
            });
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, "admin_report_create_failed")));
        },
    });
}

// ─── Action Logs ──────────────────────────────────────────────────────────────

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

// ─── Delivery Logs ────────────────────────────────────────────────────────────

const deliveryLogKeys = {
    all: ["admin", "delivery-logs"] as const,
    list: (orderId: string) => ["admin", "delivery-logs", orderId] as const,
    latest: (orderId: string) => ["admin", "delivery-logs", "latest", orderId] as const,
};

export function useAdminDeliveryLogs(orderId: string, enabled = true) {
    return useQuery({
        queryKey: deliveryLogKeys.list(orderId),
        queryFn: () => getDeliveryLogs(orderId),
        enabled: Boolean(orderId) && enabled,
    });
}

export function useAdminLatestDeliveryLog(orderId: string, enabled = true) {
    return useQuery({
        queryKey: deliveryLogKeys.latest(orderId),
        queryFn: () => getLatestDeliveryLog(orderId),
        enabled: Boolean(orderId) && enabled,
    });
}

export function useAdminCreateDeliveryLog() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: ({ orderId, payload }: { orderId: string; payload: CreateDeliveryLogRequest }) =>
            createDeliveryLog(orderId, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: deliveryLogKeys.list(variables.orderId) });
            queryClient.invalidateQueries({ queryKey: deliveryLogKeys.latest(variables.orderId) });
            toast.success(t("admin_delivery_log_created"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, "admin_delivery_log_create_failed")));
        },
    });
}

export function useAdminUpdateDeliveryLog() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: ({ deliveryLogId, payload }: { deliveryLogId: string; orderId: string; payload: CreateDeliveryLogRequest }) =>
            updateDeliveryLog(deliveryLogId, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: deliveryLogKeys.list(variables.orderId) });
            queryClient.invalidateQueries({ queryKey: deliveryLogKeys.latest(variables.orderId) });
            toast.success(t("admin_delivery_log_updated"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, "admin_delivery_log_update_failed")));
        },
    });
}

export function useAdminDeleteDeliveryLog() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: ({ deliveryLogId, orderId: _orderId }: { deliveryLogId: string; orderId: string }) =>
            deleteDeliveryLog(deliveryLogId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: deliveryLogKeys.list(variables.orderId) });
            queryClient.invalidateQueries({ queryKey: deliveryLogKeys.latest(variables.orderId) });
            toast.success(t("admin_delivery_log_deleted"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, "admin_delivery_log_delete_failed")));
        },
    });
}

export function useAdminUpdateOrderDeliveryStatus() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: ({ orderId, payload }: { orderId: string; payload: UpdateOrderDeliveryStatusRequest }) =>
            updateOrderDeliveryStatus(orderId, payload),
        onMutate: async (newStatus) => {
            await queryClient.cancelQueries({ queryKey: [...checkoutKeys.all, "admin-order", newStatus.orderId] });
            const previousOrder = queryClient.getQueryData([...checkoutKeys.all, "admin-order", newStatus.orderId]);
            if (previousOrder) {
                queryClient.setQueryData([...checkoutKeys.all, "admin-order", newStatus.orderId], {
                    ...(previousOrder as Record<string, unknown>),
                    deliveryStatus: newStatus.payload.deliveryStatus,
                });
            }
            return { previousOrder };
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: [...checkoutKeys.all, "admin-orders"] });
            queryClient.invalidateQueries({ queryKey: [...checkoutKeys.all, "admin-order", variables.orderId] });
            queryClient.invalidateQueries({ queryKey: deliveryLogKeys.list(variables.orderId) });
            queryClient.invalidateQueries({ queryKey: deliveryLogKeys.latest(variables.orderId) });
            queryClient.invalidateQueries({ queryKey: checkoutKeys.orders() });
            queryClient.invalidateQueries({ queryKey: checkoutKeys.order(variables.orderId) });
            toast.success(t("admin_order_status_updated"));
        },
        onError: (error: unknown, variables, context) => {
            if (context?.previousOrder) {
                queryClient.setQueryData(
                    [...checkoutKeys.all, "admin-order", variables.orderId],
                    context.previousOrder
                );
            }
            toast.error(t(toErrorMessage(error, "admin_order_status_update_failed")));
        },
    });
}
