import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    createDeliveryLog,
    createMonthlyRevenueReport,
    createTopSellingProductsReport,
    deleteDeliveryLog,
    getAdminActionLogById,
    getAdminActionLogs,
    getDeliveryLogs,
    getLatestDeliveryLog,
    getReportById,
    getReports,
    updateDeliveryLog,
    updateOrderDeliveryStatus,
} from "./api";
import type {
    AdminActionLogQueryParams,
    CreateDeliveryLogRequest,
    CreateMonthlyRevenueReportRequest,
    CreateTopSellingProductsReportRequest,
    ReportQueryParams,
    UpdateOrderDeliveryStatusRequest,
} from "./types";

import { checkoutKeys } from "@/constants/query-keys";
import { useLanguage } from "@/providers/language.provider";
import { toErrorMessage } from "@/utils/error-message";

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
            toast.error(t(toErrorMessage(error, 'admin_monthly_revenue_failed')));
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
            toast.error(t(toErrorMessage(error, 'admin_top_selling_failed')));
        },
    });
}

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
            toast.success(t('admin_delivery_log_created', {}, "Delivery log created"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'admin_delivery_log_create_failed')));
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
            toast.success(t('admin_delivery_log_updated', {}, "Delivery log updated"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'admin_delivery_log_update_failed')));
        },
    });
}

export function useAdminDeleteDeliveryLog() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: ({ deliveryLogId, orderId: _orderId }: { deliveryLogId: string; orderId: string }) => deleteDeliveryLog(deliveryLogId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: deliveryLogKeys.list(variables.orderId) });
            queryClient.invalidateQueries({ queryKey: deliveryLogKeys.latest(variables.orderId) });
            toast.success(t('admin_delivery_log_deleted', {}, "Delivery log deleted"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'admin_delivery_log_delete_failed')));
        },
    });
}

export function useAdminUpdateOrderDeliveryStatus() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: ({ orderId, payload }: { orderId: string; payload: UpdateOrderDeliveryStatusRequest }) =>
            updateOrderDeliveryStatus(orderId, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: [...checkoutKeys.all, "admin-orders"] });
            queryClient.invalidateQueries({ queryKey: [...checkoutKeys.all, "admin-order", variables.orderId] });
            queryClient.invalidateQueries({ queryKey: deliveryLogKeys.list(variables.orderId) });
            toast.success(t('admin_order_status_updated', {}, "Order status updated"));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'admin_order_status_update_failed')));
        },
    });
}
