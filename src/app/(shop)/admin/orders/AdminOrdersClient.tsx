"use client";

import { CheckCircle2, Circle, Clock, ListTodo, Package, PackageCheck, Plus, Search, Truck, XCircle } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
import { productKeys } from "@/constants/query-keys";
import { useLanguage } from "@/providers/language.provider";

const statusFilters: Array<{ value: string; label: string }> = [
    { value: "all", label: "all" },
    { value: "AWAITING_PAYMENT", label: "awaiting_payment" },
    { value: "AWAITING_CONFIRM", label: "awaiting_confirm" },
    { value: "PENDING", label: "pending_shipment" },
    { value: "ON_SHIPPING", label: "on_shipping" },
    { value: "DELIVERED", label: "delivered" },
    { value: "CANCELED", label: "canceled" },
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
            { deliveryLogId: editingLogId, payload: { stepStatus: editStatus as never, message: editMessage } },
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
                                        {f.value === "all" ? t("admin_all", {}, "All") : t(`admin_status_${f.label}`)}
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
                                                        ? new Date(String(order["orderDate"])).toLocaleDateString(
                                                            locale === "vi" ? "vi-VN" : "en-US"
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
                                                        className="rounded-full text-[10px] font-medium"
                                                    >
                                                        {formatOrderStatusLabel(status as DeliveryStatus, t)}
                                                    </Badge>
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs rounded-lg"
                                                        onClick={(e) => { e.stopPropagation(); setSelectedOrderId(oid); }}
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

            {selectedOrderId && (
                <div className="grid lg:grid-cols-2 gap-5">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary" />
                                {t("admin_order_detail", {}, "Order Detail")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {adminOrderQuery.isLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
                                </div>
                            ) : selectedOrder ? (
                                <>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="text-muted-foreground">{t("admin_order_id", {}, "Order ID")}:</span>
                                        <span className="font-mono text-xs">{truncateId(selectedOrder.orderId, 12)}</span>
                                        <span className="text-muted-foreground">{t("admin_date", {}, "Date")}:</span>
                                        <span>{new Date(selectedOrder.orderDate).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}</span>
                                        <span className="text-muted-foreground">{t("admin_status", {}, "Status")}:</span>
                                        <Badge
                                            variant={
                                                selectedOrder.deliveryStatus === "DELIVERED" ? "success" :
                                                    selectedOrder.deliveryStatus === "CANCELED" ? "destructive" :
                                                        selectedOrder.deliveryStatus === "ON_SHIPPING" ? "info" :
                                                            selectedOrder.deliveryStatus === "PENDING" ? "warning" :
                                                                "default"
                                            }
                                            className="rounded-full text-[10px] font-medium w-fit"
                                        >
                                            {formatOrderStatusLabel(selectedOrder.deliveryStatus, t)}
                                        </Badge>
                                        <span className="text-muted-foreground">{t("admin_total", {}, "Total")}:</span>
                                        <span className="font-semibold">
                                            {new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(selectedOrder.totalAmount)} {t("currency_vnd", {}, "VND")}
                                        </span>
                                    </div>

                                    {selectedOrder.items && selectedOrder.items.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                                                {t("admin_items", {}, "Items")}
                                            </p>
                                            <div className="space-y-1">
                                                {(selectedOrder.items as Array<Record<string, unknown>>).map((item, idx) => {
                                                    const pid = String(item["productId"] ?? "");
                                                    const prod = productMap.get(pid);
                                                    const imageUrl = prod?.variants?.[0]?.images?.[0];
                                                    const displayName = String(item['name'] ?? prod?.name ?? pid ?? `Item ${idx + 1}`);
                                                    return (
                                                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-2.5 py-1.5">
                                                            {imageUrl && (
                                                                <div className="relative w-8 h-8 shrink-0 rounded-md overflow-hidden bg-muted">
                                                                    <Image
                                                                        src={imageUrl}
                                                                        alt={displayName}
                                                                        fill
                                                                        className="object-cover"
                                                                        sizes="32px"
                                                                    />
                                                                </div>
                                                            )}
                                                            <span className="truncate flex-1">{displayName}</span>
                                                            <span className="shrink-0">x{item['quantity'] as number}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                                            {t("admin_update_status", {}, "Update Status")}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {getNextDeliveryStatuses(selectedOrder.deliveryStatus).map((next) => (
                                                <Button
                                                    key={next}
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs rounded-lg"
                                                    onClick={() => handleStatusUpdate(next)}
                                                    disabled={updateStatusMutation.isPending}
                                                >
                                                    {formatOrderStatusLabel(next as DeliveryStatus, t)}
                                                </Button>
                                            ))}
                                            {getNextDeliveryStatuses(selectedOrder.deliveryStatus).length === 0 && (
                                                <span className="text-xs text-muted-foreground">
                                                    {t("admin_no_further_updates", {}, "No further updates available")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    {t("order_not_found", {}, "Order not found")}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <ListTodo className="h-4 w-4 text-primary" />
                                {t("admin_delivery_timeline", {}, "Delivery Timeline")}
                            </CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs rounded-lg gap-1"
                                onClick={() => setShowAddForm(!showAddForm)}
                            >
                                <Plus className="h-3 w-3" />
                                {t("admin_add_log", {}, "Add")}
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {deliveryLogsQuery.isLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                                </div>
                            ) : deliveryLogs.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">
                                    {t("admin_no_delivery_logs", {}, "No delivery logs yet")}
                                </p>
                            ) : (
                                <div className="space-y-0 relative ml-2">
                                    {deliveryLogs.map((log, idx) => {
                                        const Icon = stepStatusIcons[log.status] ?? Circle;
                                        const colorClass = stepStatusColors[log.status] ?? "text-muted-foreground";
                                        const isLast = idx === deliveryLogs.length - 1;
                                        return (
                                            <div key={log.deliveryLogId} className="relative pb-4 pl-7">
                                                {!isLast && (
                                                    <div className="absolute left-[11px] top-[22px] bottom-0 w-px bg-border" />
                                                )}
                                                <div className={`absolute left-0 top-0.5 ${colorClass}`}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="text-xs space-y-0.5">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant={log.status === "COMPLETED" ? "success" : log.status === "FAILED" ? "destructive" : log.status === "PENDING" ? "warning" : "default"} className="rounded-full text-[10px] font-medium">
                                                            {formatDeliveryLogStatusLabel(log.status, t)}
                                                        </Badge>
                                                        <span className="text-muted-foreground">
                                                            {new Date(log.createdAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}
                                                        </span>
                                                    </div>
                                                    {log.message && (
                                                        <p className="text-muted-foreground">{log.message}</p>
                                                    )}
                                                    <div className="flex gap-1.5 mt-1">
                                                        <button
                                                            type="button"
                                                            className="text-[10px] text-primary hover:underline"
                                                            onClick={() => startEditLog(log)}
                                                        >
                                                            {t("admin_edit", {}, "Edit")}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="text-[10px] text-destructive hover:underline"
                                                            onClick={() => setDeleteLogConfirm(log.deliveryLogId)}
                                                        >
                                                            {t("admin_delete", {}, "Delete")}
                                                        </button>
                                                    </div>

                                                    {editingLogId === log.deliveryLogId && (
                                                        <div className="mt-2 space-y-1.5 border border-border rounded-lg p-2 bg-muted/30">
                                                            <Select value={editStatus} onValueChange={setEditStatus}>
                                                                <SelectTrigger className="h-7 text-xs rounded-lg">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {["PENDING", "COMPLETED", "FAILED"].map((s) => (
                                                                        <SelectItem key={s} value={s} className="text-xs">
                                                                            {formatDeliveryLogStatusLabel(s, t)}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <Input
                                                                value={editMessage}
                                                                onChange={(e) => setEditMessage(e.target.value)}
                                                                placeholder={t("admin_log_message", {}, "Message")}
                                                                className="h-7 text-xs rounded-lg"
                                                            />
                                                            <div className="flex gap-1.5">
                                                                <Button size="sm" className="h-7 text-xs rounded-lg" onClick={handleSaveEditLog} disabled={updateLogMutation.isPending}>
                                                                    {t("admin_save", {}, "Save")}
                                                                </Button>
                                                                <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg" onClick={() => setEditingLogId(null)}>
                                                                    {t("cancel", {}, "Cancel")}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {showAddForm && (
                                <div className="border border-border rounded-xl p-3 space-y-2 bg-muted/20">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {t("admin_add_delivery_log", {}, "Add Delivery Log")}
                                    </p>
                                    <Select value={logStatus} onValueChange={setLogStatus}>
                                        <SelectTrigger className="h-8 text-xs rounded-lg">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["PENDING", "COMPLETED", "FAILED"].map((s) => (
                                                <SelectItem key={s} value={s} className="text-xs">
                                                    {formatDeliveryLogStatusLabel(s, t)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Textarea
                                        value={logMessage}
                                        onChange={(e) => setLogMessage(e.target.value)}
                                        placeholder={t("admin_log_message_placeholder", {}, "e.g. Parcel arrived at Hanoi hub")}
                                        className="min-h-[60px] text-sm rounded-lg"
                                    />
                                    <div className="flex gap-1.5">
                                        <Button size="sm" className="h-8 text-xs rounded-lg" onClick={handleCreateLog} disabled={createLogMutation.isPending}>
                                            {t("admin_create", {}, "Create")}
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg" onClick={() => { setShowAddForm(false); setLogMessage(""); }}>
                                            {t("cancel", {}, "Cancel")}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            <ConfirmDialog
                open={deleteLogConfirm !== null}
                onOpenChange={(open) => { if (!open) setDeleteLogConfirm(null); }}
                onConfirm={() => {
                    if (deleteLogConfirm) deleteLogMutation.mutate(deleteLogConfirm);
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
