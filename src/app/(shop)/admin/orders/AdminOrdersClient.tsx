"use client";

import { useQueries } from "@tanstack/react-query";
import { CheckCircle2, Circle, Clock, ListTodo, Package, PackageCheck, Plus, Search, Truck, XCircle } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { productKeys } from "@/constants/query-keys";
import {
    useAdminCreateDeliveryLog,
    useAdminDeleteDeliveryLog,
    useAdminDeliveryLogs,
    useAdminUpdateDeliveryLog,
    useAdminUpdateOrderDeliveryStatus,
} from "@/features/admin/hooks";
import { useAdminOrder, useAdminOrders } from "@/features/orders/hooks";
import { formatDeliveryLogStatusLabel, formatOrderStatusLabel, truncateId } from "@/features/orders/presentation";
import type { DeliveryStatus } from "@/features/orders/types";
import { getProductById } from "@/features/products/api";
import type { Product } from "@/features/products/types";
import { useLanguage } from "@/providers/language.provider";

const statusFilters: Array<{ value: string; label: string }> = [
    { value: "all", label: "admin_status_all" },
    { value: "AWAITING_PAYMENT", label: "admin_status_awaiting_payment" },
    { value: "AWAITING_CONFIRM", label: "admin_status_awaiting_confirm" },
    { value: "PENDING", label: "admin_status_pending_shipment" },
    { value: "ON_SHIPPING", label: "admin_status_on_shipping" },
    { value: "DELIVERED", label: "admin_status_delivered" },
    { value: "CANCELED", label: "admin_status_canceled" },
];

const stepStatusIcons: Record<string, typeof Circle> = {
    PENDING: Clock,
    COMPLETED: CheckCircle2,
    COMPENSATING: ListTodo,
    COMPENSATED: PackageCheck,
    FAILED: XCircle,
};

const stepStatusColors: Record<string, string> = {
    PENDING: "text-amber-500",
    COMPLETED: "text-emerald-500",
    COMPENSATING: "text-blue-500",
    COMPENSATED: "text-slate-500",
    FAILED: "text-red-500",
};

function getNextDeliveryStatuses(current: string): string[] {
    const flow: Record<string, string[]> = {
        AWAITING_PAYMENT: ["AWAITING_CONFIRM", "CANCELED"],
        AWAITING_CONFIRM: ["PENDING", "CANCELED"],
        PENDING: ["ON_SHIPPING", "CANCELED"],
        ON_SHIPPING: ["DELIVERED", "CANCELED"],
        DELIVERED: [],
        CANCELED: [],
    };
    return flow[current] ?? [];
}

export default function AdminOrdersClient() {
    const { t, locale } = useLanguage();
    const [searchId, setSearchId] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [logStatus, setLogStatus] = useState("COMPLETED");
    const [logMessage, setLogMessage] = useState("");

    const orderStatusParam = statusFilter !== "all" ? { status: statusFilter as DeliveryStatus } : {};
    const orderParams = { page: 0, size: 80, sortBy: "orderDate", sortDirection: "DESC" as const, ...orderStatusParam };
    const allOrdersQuery = useAdminOrders(orderParams);

    const adminOrderQuery = useAdminOrder(selectedOrderId ?? "", Boolean(selectedOrderId));
    const deliveryLogsQuery = useAdminDeliveryLogs(selectedOrderId ?? "", Boolean(selectedOrderId));

    const createLogMutation = useAdminCreateDeliveryLog();
    const updateLogMutation = useAdminUpdateDeliveryLog();
    const deleteLogMutation = useAdminDeleteDeliveryLog();
    const updateStatusMutation = useAdminUpdateOrderDeliveryStatus();

    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [editStatus, setEditStatus] = useState("");
    const [editMessage, setEditMessage] = useState("");
    const [deleteLogConfirm, setDeleteLogConfirm] = useState<string | null>(null);

    const orders = useMemo(() => {
        const items = allOrdersQuery.data?.items ?? [];
        if (!searchId.trim()) return items;
        const kw = searchId.trim().toLowerCase();
        return items.filter((o: Record<string, unknown>) => String(o["orderId"]).toLowerCase().includes(kw));
    }, [allOrdersQuery.data?.items, searchId]);

    const selectedOrder = adminOrderQuery.data;
    const deliveryLogs = deliveryLogsQuery.data ?? [];

    const uniqueProductIds = useMemo(() => {
        if (!selectedOrder?.items) return [];
        const ids = new Set<string>();
        (selectedOrder.items as Array<Record<string, unknown>>).forEach((item) => {
            const pid = String(item["productId"] ?? "");
            if (pid) ids.add(pid);
        });
        return Array.from(ids);
    }, [selectedOrder]);

    const productQueries = useQueries({
        queries: uniqueProductIds.map((id) => ({
            queryKey: productKeys.detail(id),
            queryFn: () => getProductById(id),
            enabled: Boolean(id) && Boolean(selectedOrderId),
            staleTime: 1000 * 60 * 10,
        })),
    });

    const productMap = useMemo(() => {
        const map = new Map<string, Product>();
        uniqueProductIds.forEach((id, idx) => {
            const data = productQueries[idx]?.data;
            if (data) map.set(id, data);
        });
        return map;
    }, [uniqueProductIds, productQueries]);

    const startEditLog = (log: { deliveryLogId: string; status: string; message: string }) => {
        setEditingLogId(log.deliveryLogId);
        setEditStatus(log.status);
        setEditMessage(log.message);
    };

    const handleSaveEditLog = () => {
        if (!editingLogId || !editStatus.trim()) return;
        updateLogMutation.mutate(
            { deliveryLogId: editingLogId, orderId: selectedOrderId!, payload: { stepStatus: editStatus as never, message: editMessage } },
            { onSuccess: () => setEditingLogId(null) }
        );
    };

    const handleCreateLog = () => {
        if (!selectedOrderId || !logStatus.trim()) return;
        createLogMutation.mutate(
            { orderId: selectedOrderId, payload: { stepStatus: logStatus as never, message: logMessage } },
            { onSuccess: () => { setShowAddForm(false); setLogMessage(""); } }
        );
    };

    const handleStatusUpdate = (nextStatus: string) => {
        if (!selectedOrderId) return;
        updateStatusMutation.mutate({ orderId: selectedOrderId, payload: { deliveryStatus: nextStatus as string } });
    };

    return (
        <div className="container mx-auto px-4 py-6 space-y-5">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        {t("admin_order_management", {}, "Order Management")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                placeholder={t("admin_search_order_id", {}, "Search by order ID")}
                                className="h-9 pl-9 text-sm rounded-xl"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-9 min-w-36 text-sm rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statusFilters.map((f) => (
                                    <SelectItem key={f.value} value={f.value}>
                                        {t(f.label)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {allOrdersQuery.isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                        </div>
                    ) : orders.length === 0 ? (
                        <p className="text-center py-8 text-sm text-muted-foreground">
                            {t("admin_no_orders_found", {}, "No orders found")}
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            {t("admin_order_id", {}, "Order ID")}
                                        </th>
                                        <th className="py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            {t("admin_date", {}, "Date")}
                                        </th>
                                        <th className="py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            {t("admin_items", {}, "Items")}
                                        </th>
                                        <th className="py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            {t("admin_status", {}, "Status")}
                                        </th>
                                        <th className="py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            {t("admin_action", {}, "Action")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order: Record<string, unknown>, i: number) => {
                                        const oid = String(order["orderId"]);
                                        const status = order["deliveryStatus"] as string;
                                        return (
                                            <tr
                                                key={oid}
                                                className={`transition-colors hover:bg-accent/50 cursor-pointer ${i % 2 === 0 ? "bg-muted/30" : ""
                                                    } ${selectedOrderId === oid ? "bg-accent" : ""}`}
                                                onClick={() => setSelectedOrderId(oid)}
                                            >
                                                <td className="py-2.5 px-3 font-mono text-xs">
                                                    {truncateId(oid)}
                                                </td>
                                                <td className="py-2.5 px-3 text-muted-foreground text-xs">
                                                    {order["orderDate"]
                                                        ? new Date(String(order["orderDate"]).includes('T') && !String(order["orderDate"]).includes('Z') && !String(order["orderDate"]).includes('+') ? `${order["orderDate"]}Z` : String(order["orderDate"])).toLocaleString(
                                                            locale === "vi" ? "vi-VN" : "en-US",
                                                            { timeZone: "Asia/Ho_Chi_Minh", hour12: false }
                                                        )
                                                        : "-"}
                                                </td>
                                                <td className="py-2.5 px-3 text-muted-foreground text-xs">
                                                    {Array.isArray(order["items"]) ? order["items"].length : 0}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <Badge
                                                        variant={
                                                            status === "DELIVERED" ? "success" :
                                                                status === "CANCELED" ? "destructive" :
                                                                    status === "ON_SHIPPING" ? "info" :
                                                                        status === "PENDING" ? "warning" :
                                                                            "default"
                                                        }
                                                        className="rounded-full text-tiny font-medium"
                                                    >
                                                        {formatOrderStatusLabel(status as DeliveryStatus, t)}
                                                    </Badge>
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs rounded-lg"
                                                        onClick={(e) => { e.stopPropagation(); setSelectedOrderId(oid); setShowAddForm(false); setEditingLogId(null); }}

                                                    >
                                                        {t("admin_view", {}, "View")}
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
                <DialogContent className="w-full max-w-7xl max-h-[95vh] overflow-y-auto p-4 md:p-8 bg-slate-50/50">
                    <DialogHeader className="mb-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <DialogTitle className="text-2xl font-bold tracking-tight">
                                    {t("admin_order_detail", {}, "Order Detail")}
                                </DialogTitle>
                                <p className="text-sm text-muted-foreground mt-1 font-mono uppercase">
                                    ID: {selectedOrderId}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedOrder && (
                                    <Badge
                                        variant={
                                            selectedOrder.deliveryStatus === "DELIVERED" ? "success" :
                                                selectedOrder.deliveryStatus === "CANCELED" ? "destructive" :
                                                    selectedOrder.deliveryStatus === "ON_SHIPPING" ? "info" :
                                                        selectedOrder.deliveryStatus === "PENDING" ? "warning" :
                                                            "default"
                                        }
                                        className="h-9 px-4 rounded-full text-sm font-semibold shadow-sm"
                                    >
                                        {formatOrderStatusLabel(selectedOrder.deliveryStatus, t)}
                                    </Badge>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedOrderId(null)}
                                    className="h-9 w-9 p-0 rounded-full md:hidden"
                                >
                                    <XCircle className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    {selectedOrder ? (
                        <div className="space-y-8">
                            {/* Quick Stats Header */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t("admin_date", {}, "Date")}</p>
                                    <p className="font-semibold text-slate-900">
                                        {new Date(String(selectedOrder.orderDate).includes('Z') || String(selectedOrder.orderDate).includes('+') ? selectedOrder.orderDate : `${selectedOrder.orderDate}Z`).toLocaleString(locale === "vi" ? "vi-VN" : "en-US", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "medium", timeStyle: "short" })}
                                    </p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t("admin_total", {}, "Total Amount")}</p>
                                    <p className="text-xl font-bold text-primary">
                                        {new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(selectedOrder.totalAmount)} <span className="text-sm font-normal text-muted-foreground">{t("currency_vnd", {}, "VND")}</span>
                                    </p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t("admin_items_count", {}, "Items Count")}</p>
                                    <p className="text-xl font-bold text-slate-900">
                                        {selectedOrder.items?.length ?? 0} <span className="text-sm font-normal text-muted-foreground">{t("admin_items", {}, "Items")}</span>
                                    </p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t("admin_payment_method", {}, "Payment")}</p>
                                    <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                                        <Clock className="h-4 w-4 text-amber-500" />
                                        {t("admin_cod", {}, "COD")}
                                    </p>
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Main Content Column: Items & Actions */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Items List */}
                                    <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                                        <CardHeader className="bg-slate-50 border-b border-slate-100 px-6 py-4">
                                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                                <Package className="h-5 w-5 text-primary" />
                                                {t("admin_order_items", {}, "Order Items")}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="divide-y divide-slate-100">
                                                {selectedOrder.items && (selectedOrder.items as Array<Record<string, unknown>>).map((item, idx) => {
                                                    const pid = String(item["productId"] ?? "");
                                                    const prod = productMap.get(pid);
                                                    const imageUrl = prod?.variants?.[0]?.images?.[0];
                                                    const displayName = String(item['name'] ?? prod?.name ?? pid ?? `Item ${idx + 1}`);
                                                    return (
                                                        <div key={idx} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                                            <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                                                {imageUrl ? (
                                                                    <Image
                                                                        src={imageUrl}
                                                                        alt={displayName}
                                                                        fill
                                                                        className="object-cover"
                                                                        sizes="64px"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                        <Package className="h-8 w-8" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-slate-900 truncate">{displayName}</p>
                                                                <p className="text-xs text-slate-500 font-mono mt-0.5">PID: {pid}</p>
                                                            </div>
                                                            <div className="text-right space-y-1">
                                                                <p className="text-sm font-bold text-slate-900">x{item['quantity'] as number}</p>
                                                                <p className="text-xs text-slate-500">
                                                                    {new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(Number(item['price'] ?? 0))}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Action Card: Status Update */}
                                    <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-primary/5 to-transparent">
                                        <CardHeader className="px-6 py-4">
                                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                                <Truck className="h-5 w-5 text-primary" />
                                                {t("admin_order_actions", {}, "Quick Actions")}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-6 pb-6 pt-0">
                                            <div className="space-y-4">
                                                <p className="text-sm font-medium text-slate-600">
                                                    {t("admin_update_status_instruction", {}, "Select next status for this order:")}
                                                </p>
                                                <div className="flex flex-wrap gap-3">
                                                    {getNextDeliveryStatuses(selectedOrder.deliveryStatus).map((next) => (
                                                        <Button
                                                            key={next}
                                                            variant="default"
                                                            size="lg"
                                                            className="h-11 px-6 rounded-xl font-semibold shadow-sm"
                                                            onClick={() => handleStatusUpdate(next)}
                                                            disabled={updateStatusMutation.isPending}
                                                        >
                                                            {formatOrderStatusLabel(next as DeliveryStatus, t)}
                                                        </Button>
                                                    ))}
                                                    {getNextDeliveryStatuses(selectedOrder.deliveryStatus).length === 0 && (
                                                        <div className="w-full p-4 rounded-xl bg-slate-100 text-slate-500 text-sm flex items-center justify-center gap-2 border border-slate-200 border-dashed">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            {t("admin_order_completed_no_updates", {}, "Order reached final state. No further updates.")}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Sidebar Column: Timeline */}
                                <div className="space-y-6">
                                    <Card className="border-none shadow-sm rounded-2xl">
                                        <CardHeader className="px-6 py-4 border-b border-slate-50 flex flex-row items-center justify-between">
                                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                                <ListTodo className="h-5 w-5 text-primary" />
                                                {t("admin_delivery_timeline", {}, "Timeline")}
                                            </CardTitle>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-8 px-3 rounded-lg text-xs gap-1.5"
                                                onClick={() => setShowAddForm(!showAddForm)}
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                {t("admin_add", {}, "Add")}
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                                {deliveryLogs.length === 0 ? (
                                                    <div className="text-center py-8 text-slate-400 space-y-2">
                                                        <Clock className="h-8 w-8 mx-auto opacity-20" />
                                                        <p className="text-sm italic">{t("admin_no_logs", {}, "No activity logs yet")}</p>
                                                    </div>
                                                ) : (
                                                    deliveryLogs.map((log) => {
                                                        const Icon = stepStatusIcons[log.status] ?? Circle;
                                                        const colorClass = stepStatusColors[log.status] ?? "text-muted-foreground";
                                                        return (
                                                            <div key={log.deliveryLogId} className="relative pl-8 group">
                                                                <div className={`absolute left-0 top-0.5 w-6 h-6 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center z-10 ${colorClass}`}>
                                                                    <Icon className="h-4 w-4" />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                            {new Date(log.createdAt.includes('T') && !log.createdAt.includes('Z') && !log.createdAt.includes('+') ? `${log.createdAt}Z` : log.createdAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-US", { timeZone: "Asia/Ho_Chi_Minh", hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                                                        </span>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`text-xs font-bold ${colorClass}`}>
                                                                                {formatDeliveryLogStatusLabel(log.status, t)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {log.message && (
                                                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                                                                            {log.message}
                                                                        </div>
                                                                    )}
                                                                    <div className="flex gap-3 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button
                                                                            type="button"
                                                                            className="text-[10px] font-bold text-primary uppercase hover:tracking-wider transition-all"
                                                                            onClick={() => startEditLog(log)}
                                                                        >
                                                                            {t("admin_edit", {}, "Edit")}
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="text-[10px] font-bold text-destructive uppercase hover:tracking-wider transition-all"
                                                                            onClick={() => setDeleteLogConfirm(log.deliveryLogId)}
                                                                        >
                                                                            {t("admin_delete", {}, "Delete")}
                                                                        </button>
                                                                    </div>

                                                                    {editingLogId === log.deliveryLogId && (
                                                                        <div className="mt-3 space-y-2 p-3 bg-white border border-slate-200 rounded-xl shadow-inner">
                                                                            <Select value={editStatus} onValueChange={setEditStatus}>
                                                                                <SelectTrigger className="h-9 rounded-lg">
                                                                                    <SelectValue />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {["PENDING", "COMPLETED", "FAILED"].map((s) => (
                                                                                        <SelectItem key={s} value={s} className="text-sm">
                                                                                            {formatDeliveryLogStatusLabel(s, t)}
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <Input
                                                                                value={editMessage}
                                                                                onChange={(e) => setEditMessage(e.target.value)}
                                                                                placeholder={t("admin_log_message", {}, "Message")}
                                                                                className="h-9 rounded-lg"
                                                                            />
                                                                            <div className="flex gap-2">
                                                                                <Button size="sm" className="flex-1 rounded-lg" onClick={handleSaveEditLog} disabled={updateLogMutation.isPending}>
                                                                                    {t("admin_save", {}, "Save")}
                                                                                </Button>
                                                                                <Button size="sm" variant="ghost" className="flex-1 rounded-lg" onClick={() => setEditingLogId(null)}>
                                                                                    {t("cancel", {}, "Cancel")}
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>

                                            {showAddForm && (
                                                <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        <Plus className="h-3 w-3" />
                                                        {t("admin_add_log_entry", {}, "New Log Entry")}
                                                    </p>
                                                    <div className="space-y-3">
                                                        <Select value={logStatus} onValueChange={setLogStatus}>
                                                            <SelectTrigger className="h-10 rounded-xl">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {["PENDING", "COMPLETED", "FAILED"].map((s) => (
                                                                    <SelectItem key={s} value={s}>
                                                                        {formatDeliveryLogStatusLabel(s, t)}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Textarea
                                                            value={logMessage}
                                                            onChange={(e) => setLogMessage(e.target.value)}
                                                            placeholder={t("admin_log_placeholder", {}, "Enter event details...")}
                                                            className="min-h-[100px] rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button className="flex-1 rounded-xl h-11" onClick={handleCreateLog} disabled={createLogMutation.isPending}>
                                                                {t("admin_create", {}, "Add to Timeline")}
                                                            </Button>
                                                            <Button variant="ghost" className="rounded-xl h-11 px-6" onClick={() => { setShowAddForm(false); setLogMessage(""); }}>
                                                                {t("cancel", {}, "Cancel")}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    ) : adminOrderQuery.isLoading ? (
                        <div className="space-y-8 animate-pulse">
                            <div className="h-20 bg-slate-100 rounded-2xl w-full" />
                            <div className="grid lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 h-96 bg-slate-100 rounded-2xl" />
                                <div className="h-96 bg-slate-100 rounded-2xl" />
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center space-y-4">
                            <Package className="h-16 w-16 mx-auto text-slate-200" />
                            <p className="text-slate-500 font-medium">{t("order_not_found", {}, "Order not found or access denied")}</p>
                            <Button onClick={() => setSelectedOrderId(null)}>{t("admin_back_to_list", {}, "Back to List")}</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleteLogConfirm !== null}
                onOpenChange={(open) => { if (!open) setDeleteLogConfirm(null); }}
                onConfirm={() => {
                    if (deleteLogConfirm && selectedOrderId) {
                        deleteLogMutation.mutate({ deliveryLogId: deleteLogConfirm, orderId: selectedOrderId });
                    }
                    setDeleteLogConfirm(null);
                }}
                title={t("admin_confirm_delete_log", {}, "Delete this log entry?")}
                confirmText={t("confirm", {}, "Confirm")}
                cancelText={t("cancel", {}, "Cancel")}
                variant="destructive"
            />
        </div>
    );
}
