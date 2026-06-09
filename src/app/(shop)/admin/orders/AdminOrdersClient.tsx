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
    { value: "RECEIVED", label: "admin_status_received" },
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
        AWAITING_PAYMENT: ["AWAITING_CONFIRM"],
        AWAITING_CONFIRM: ["PENDING"],
        PENDING: ["ON_SHIPPING"],
        ON_SHIPPING: ["DELIVERED"],
        DELIVERED: [],
        RECEIVED: [],
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

        const parseSafeDate = (d: unknown) => {
            if (!d) return 0;
            const s = String(d);
            const iso = s.includes('T') && !s.includes('Z') && !s.includes('+') ? `${s}Z` : s;
            return new Date(iso).getTime();
        };

        const sorted = [...items].sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
            const dateA = parseSafeDate(a["orderDate"]);
            const dateB = parseSafeDate(b["orderDate"]);
            if (dateB !== dateA) {
                return dateB - dateA;
            }
            const updateA = parseSafeDate(a["updatedAt"]);
            const updateB = parseSafeDate(b["updatedAt"]);
            return updateB - updateA;
        });

        if (!searchId.trim()) return sorted;
        const kw = searchId.trim().toLowerCase();
        return sorted.filter((o: Record<string, unknown>) => String(o["orderId"]).toLowerCase().includes(kw));
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
                                            {t("admin_last_update", {}, locale === "vi" ? "Cập nhật cuối" : "Last Update")}
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
                                    {orders.map((order, i: number) => {
                                        const oid = String(order.orderId);
                                        const status = order.deliveryStatus;
                                        
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
                                                    {order.orderDate
                                                        ? new Date(String(order.orderDate).includes('T') && !String(order.orderDate).includes('Z') && !String(order.orderDate).includes('+') ? `${order.orderDate}Z` : String(order.orderDate)).toLocaleDateString(
                                                            locale === "vi" ? "vi-VN" : "en-US",
                                                            { timeZone: "Asia/Ho_Chi_Minh" }
                                                        )
                                                        : "-"}
                                                </td>
                                                <td className="py-2.5 px-3 text-muted-foreground text-xs font-mono">
                                                    {order.updatedAt
                                                        ? new Date(String(order.updatedAt).includes('T') && !String(order.updatedAt).includes('Z') && !String(order.updatedAt).includes('+') ? `${order.updatedAt}Z` : String(order.updatedAt)).toLocaleString(
                                                            locale === "vi" ? "vi-VN" : "en-US",
                                                            { timeZone: "Asia/Ho_Chi_Minh", hour12: false }
                                                        )
                                                        : "-"}
                                                </td>
                                                <td className="py-2.5 px-3 text-muted-foreground text-xs">
                                                    {Array.isArray(order.items) ? order.items.length : 0}
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
                <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl border-none shadow-premium transition-all duration-300">
                    <DialogHeader className="p-6 border-b bg-card">
                        <div className="flex items-center justify-between pr-8">
                            <div className="space-y-1 min-w-0">
                                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                    <Package className="h-5 w-5 text-primary shrink-0" />
                                    <span className="truncate">{t("admin_order_detail")}</span>
                                </DialogTitle>
                                <p className="text-[10px] text-muted-foreground font-mono break-all opacity-70">
                                    ID: {selectedOrderId}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                {selectedOrder && (
                                    <Badge
                                        variant={
                                            selectedOrder.deliveryStatus === "DELIVERED" ? "success" :
                                                selectedOrder.deliveryStatus === "CANCELED" ? "destructive" :
                                                    selectedOrder.deliveryStatus === "ON_SHIPPING" ? "info" :
                                                        selectedOrder.deliveryStatus === "PENDING" ? "warning" :
                                                            "default"
                                        }
                                        className="h-8 px-3 rounded-full text-xs font-semibold whitespace-nowrap"
                                    >
                                        {formatOrderStatusLabel(selectedOrder.deliveryStatus, t)}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {selectedOrder ? (
                            <>
                                {/* Order Overview Stats */}
                                <div className="flex flex-wrap items-stretch gap-4">
                                    {[
                                        { label: t("admin_date"), value: new Date(String(selectedOrder.orderDate).includes('Z') || String(selectedOrder.orderDate).includes('+') ? selectedOrder.orderDate : `${selectedOrder.orderDate}Z`).toLocaleDateString(locale, { dateStyle: 'medium' }), icon: Clock },
                                        { label: t("admin_total"), value: `${new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(selectedOrder.totalAmount)} ${t("currency_vnd")}`, highlight: true, icon: Package },
                                        { label: t("admin_items"), value: `${selectedOrder.items?.length ?? 0} ${t("admin_items").toLowerCase()}`, icon: ListTodo },
                                        { label: t("admin_payment_method"), value: t("admin_cod"), icon: CheckCircle2 },
                                    ].map((stat, i) => (
                                        <div key={i} className="flex-1 min-w-[140px] p-4 rounded-xl border bg-card hover:border-primary/30 transition-all duration-300 group shadow-sm">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">{stat.label}</p>
                                                    <p className={`text-base font-bold tracking-tight ${stat.highlight ? "text-primary" : "text-foreground"}`}>{stat.value}</p>
                                                </div>
                                                <stat.icon className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary/50 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid lg:grid-cols-5 gap-6">
                                    {/* Items & Actions (3/5 width) */}
                                    <div className="lg:col-span-3 space-y-6">
                                        <section className="space-y-3">
                                            <h4 className="text-sm font-bold flex items-center gap-2 px-1">
                                                <ListTodo className="h-4 w-4 text-primary" />
                                                {t("admin_order_items")}
                                            </h4>
                                            <div className="rounded-xl border divide-y overflow-hidden bg-card">
                                                {selectedOrder.items && (selectedOrder.items as Array<Record<string, unknown>>).map((item, idx) => {
                                                    const pid = String(item["productId"] ?? "");
                                                    const prod = productMap.get(pid);
                                                    const imageUrl = prod?.variants?.[0]?.images?.[0];
                                                    const displayName = String(item['name'] ?? prod?.name ?? pid ?? `Item ${idx + 1}`);
                                                    return (
                                                        <div key={idx} className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
                                                            <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden border bg-muted">
                                                                {imageUrl ? (
                                                                    <Image src={imageUrl} alt={displayName} fill className="object-cover" sizes="48px" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><Package className="h-6 w-6" /></div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold truncate">{displayName}</p>
                                                                <p className="text-[10px] text-muted-foreground font-mono">SKU: {pid.slice(0, 8)}...</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-bold">x{item['quantity'] as number}</p>
                                                                <p className="text-[11px] text-muted-foreground">
                                                                    {new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(Number(item['unitPrice'] ?? 0))}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </section>

                                        <section className="p-4 rounded-xl border bg-primary/5 space-y-3">
                                            <h4 className="text-sm font-bold flex items-center gap-2">
                                                <Truck className="h-4 w-4 text-primary" />
                                                {t("admin_order_actions")}
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {getNextDeliveryStatuses(selectedOrder.deliveryStatus).map((next) => (
                                                    <Button
                                                        key={next}
                                                        size="sm"
                                                        className="rounded-lg h-9 px-4 font-semibold"
                                                        onClick={() => handleStatusUpdate(next)}
                                                        disabled={updateStatusMutation.isPending}
                                                    >
                                                        {formatOrderStatusLabel(next as DeliveryStatus, t)}
                                                    </Button>
                                                ))}
                                                {getNextDeliveryStatuses(selectedOrder.deliveryStatus).length === 0 && (
                                                    <div className="w-full py-3 px-4 rounded-lg bg-background/50 border border-dashed text-xs text-muted-foreground flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                        {t("admin_order_completed_no_updates")}
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    </div>

                                    {/* Timeline (2/5 width) */}
                                    <div className="lg:col-span-2">
                                        <section className="space-y-3">
                                            <div className="flex items-center justify-between px-1">
                                                <h4 className="text-sm font-bold flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-primary" />
                                                    {t("admin_delivery_timeline")}
                                                </h4>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 px-2 rounded-lg text-[10px] uppercase font-bold"
                                                    onClick={() => setShowAddForm(!showAddForm)}
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    {t("admin_add")}
                                                </Button>
                                            </div>

                                            <div className="rounded-xl border bg-card p-4">
                                                <div className="space-y-5 relative before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                                                    {deliveryLogs.length === 0 ? (
                                                        <p className="text-xs italic text-muted-foreground text-center py-4">{t("admin_no_logs")}</p>
                                                    ) : (
                                                        deliveryLogs.map((log) => {
                                                            const Icon = stepStatusIcons[log.status] ?? Circle;
                                                            const colorClass = stepStatusColors[log.status] ?? "text-muted-foreground";
                                                            const isEditing = editingLogId === log.deliveryLogId;
                                                            return (
                                                                <div key={log.deliveryLogId} className="relative pl-7 space-y-1">
                                                                    <div className={`absolute left-0 top-0.5 w-5 h-5 rounded-full bg-background border flex items-center justify-center z-10 ${colorClass}`}>
                                                                        <Icon className="h-3 w-3" />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                                                            {new Date(log.createdAt.includes('T') && !log.createdAt.includes('Z') && !log.createdAt.includes('+') ? `${log.createdAt}Z` : log.createdAt).toLocaleString(locale, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                                                        </span>
                                                                        <span className={`text-[11px] font-bold ${colorClass}`}>
                                                                            {formatDeliveryLogStatusLabel(log.status, t)}
                                                                        </span>
                                                                    </div>
                                                                    {log.message && !isEditing && (
                                                                        <p className="text-xs text-muted-foreground leading-relaxed">{log.message}</p>
                                                                    )}
                                                                    
                                                                    {isEditing ? (
                                                                        <div className="mt-2 space-y-2 p-2 rounded-lg border bg-muted/30">
                                                                            <Select value={editStatus} onValueChange={setEditStatus}>
                                                                                <SelectTrigger className="h-8 text-xs rounded-md"><SelectValue /></SelectTrigger>
                                                                                <SelectContent>{["PENDING", "COMPLETED", "FAILED"].map(s => <SelectItem key={s} value={s} className="text-xs">{formatDeliveryLogStatusLabel(s, t)}</SelectItem>)}</SelectContent>
                                                                            </Select>
                                                                            <Input value={editMessage} onChange={(e) => setEditMessage(e.target.value)} placeholder={t("admin_log_message")} className="h-8 text-xs rounded-md" />
                                                                            <div className="flex gap-1">
                                                                                <Button size="sm" className="h-7 text-[10px] flex-1 rounded-md" onClick={handleSaveEditLog} disabled={updateLogMutation.isPending}>{t("admin_save")}</Button>
                                                                                <Button size="sm" variant="ghost" className="h-7 text-[10px] flex-1 rounded-md" onClick={() => setEditingLogId(null)}>{t("cancel")}</Button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex gap-3 pt-0.5">
                                                                            <button type="button" className="text-[9px] font-bold text-primary uppercase hover:underline" onClick={() => startEditLog(log)}>{t("admin_edit")}</button>
                                                                            <button type="button" className="text-[9px] font-bold text-destructive uppercase hover:underline" onClick={() => setDeleteLogConfirm(log.deliveryLogId)}>{t("admin_delete")}</button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>

                                                {showAddForm && (
                                                    <div className="mt-6 pt-5 border-t space-y-3">
                                                        <Select value={logStatus} onValueChange={setLogStatus}>
                                                            <SelectTrigger className="h-9 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                                                            <SelectContent>{["PENDING", "COMPLETED", "FAILED"].map(s => <SelectItem key={s} value={s} className="text-xs">{formatDeliveryLogStatusLabel(s, t)}</SelectItem>)}</SelectContent>
                                                        </Select>
                                                        <Textarea
                                                            value={logMessage}
                                                            onChange={(e) => setLogMessage(e.target.value)}
                                                            placeholder={t("admin_log_placeholder")}
                                                            className="min-h-[80px] text-xs rounded-lg resize-none"
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button size="sm" className="flex-1 rounded-lg h-9 text-xs" onClick={handleCreateLog} disabled={createLogMutation.isPending}>{t("admin_create")}</Button>
                                                            <Button size="sm" variant="ghost" className="rounded-lg h-9 text-xs" onClick={() => { setShowAddForm(false); setLogMessage(""); }}>{t("cancel")}</Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </>
                        ) : adminOrderQuery.isLoading ? (
                            <div className="space-y-6 animate-pulse">
                                <div className="grid grid-cols-4 gap-4"><div className="h-16 bg-muted rounded-xl col-span-4" /></div>
                                <div className="grid grid-cols-5 gap-6"><div className="col-span-3 h-64 bg-muted rounded-xl" /><div className="col-span-2 h-64 bg-muted rounded-xl" /></div>
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <Package className="h-12 w-12 mx-auto text-muted-foreground/20" />
                                <p className="text-sm text-muted-foreground">{t("order_not_found")}</p>
                                <Button size="sm" onClick={() => setSelectedOrderId(null)} className="rounded-xl">{t("admin_back_to_list")}</Button>
                            </div>
                        )}
                    </div>
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
