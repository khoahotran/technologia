"use client";

import { ArrowDown, ArrowUp, BarChart3, ChevronLeft, ChevronRight, Download, ExternalLink, FileText, ListChecks, Search, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    useAdminActionLog,
    useAdminActionLogs,
    useAdminReports,
    useCreateMonthlyRevenueReport,
    useCreateTopSellingProductsReport,
} from "@/features/admin/hooks";
import type { ReportResponse, ReportType } from "@/features/admin/types";
import { useAdminOrders } from "@/features/orders/hooks";
import { truncateId } from "@/features/orders/presentation";
import { useProducts } from "@/features/products/hooks";
import { useLanguage } from "@/providers/language.provider";

const reportTypeOptions: Array<{ value: "all" | ReportType; label: string }> = [
    { value: "all", label: "admin_status_all" },
    { value: "MONTHLY_REVENUE", label: "monthly_revenue" },
    { value: "TOP_SELLING_PRODUCTS", label: "top_selling_products" },
];

const entityTypeOptions = [
    { value: "all", label: "admin_status_all" },
    { value: "ORDER", label: "admin_orders" },
    { value: "PRODUCT", label: "admin_products" },
    { value: "CATEGORY", label: "admin_categories" },
    { value: "BRAND", label: "admin_brands" },
    { value: "DISCOUNT", label: "admin_discounts" },
];

function getBadgeVariant(type: string | undefined): "info" | "success" | "default" {
    if (type === "MONTHLY_REVENUE") return "info";
    if (type === "TOP_SELLING_PRODUCTS") return "success";
    return "default";
}

type TableRow = { key: string;[field: string]: string };
type TableColumn = { key: string; label: string };

function getPaginationItems(current: number, last: number): (number | "...")[] {
    const items: (number | "...")[] = [];
    if (last <= 7) {
        for (let i = 1; i <= last; i++) items.push(i);
    } else {
        items.push(1);
        if (current > 3) items.push("...");
        const start = Math.max(2, current - 1);
        const end = Math.min(last - 1, current + 1);
        for (let i = start; i <= end; i++) items.push(i);
        if (current < last - 2) items.push("...");
        items.push(last);
    }
    return items;
}

function ReportTable({
    title,
    rows,
    columns,
    page,
    totalPages,
    onPageChange,
    search,
    onSearchChange,
    sortBy,
    onSortByChange,
    size,
    onSizeChange,
}: {
    title: string;
    rows: TableRow[];
    columns: TableColumn[];
    page: number;
    totalPages: number;
    onPageChange: (nextPage: number) => void;
    search: string;
    onSearchChange: (value: string) => void;
    sortBy: string;
    onSortByChange: (value: string) => void;
    size: number;
    onSizeChange: (value: number) => void;
}) {
    const { t } = useLanguage();
    const paginationItems = useMemo(() => getPaginationItems(page + 1, totalPages), [page, totalPages]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={t("admin_search_here")}
                            className="h-9 pl-9 text-sm rounded-xl"
                        />
                    </div>
                    <Select value={sortBy} onValueChange={onSortByChange}>
                        <SelectTrigger className="h-9 min-w-32 text-sm rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="createdAt">{t("admin_created_date")}</SelectItem>
                            <SelectItem value="name">{t("admin_name")}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={String(size)} onValueChange={(v) => onSizeChange(Number(v))}>
                        <SelectTrigger className="h-9 min-w-20 text-sm rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                {columns.map((col) => (
                                    <th key={col.key} className="py-2.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="py-8 text-center text-muted-foreground text-sm">
                                        {t("admin_no_reports")}
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row, i) => (
                                    <tr key={row.key} className={`transition-colors hover:bg-accent/50 ${i % 2 === 0 ? "bg-muted/30" : ""}`}>
                                        {columns.map((col) => (
                                            <td key={col.key} className="py-2.5 px-3 border-r border-border/30 last:border-r-0 whitespace-nowrap">
                                                {col.key === "reportType" ? (
                                                    <Badge variant={getBadgeVariant(row[col.key])} className="rounded-full text-tiny font-medium">
                                                        {row[col.key] === "MONTHLY_REVENUE"
                                                            ? t("monthly_revenue")
                                                            : t("top_selling_products")}
                                                    </Badge>
                                                ) : col.key === "action" ? (
                                                    <a
                                                        href={row[col.key]}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-primary hover:underline text-xs font-medium"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                        {t("admin_download")}
                                                    </a>
                                                ) : (
                                                    <span className={col.key === "id" ? "font-mono text-xs text-muted-foreground" : ""}>
                                                        {row[col.key]}
                                                    </span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center pt-1">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); onPageChange(Math.max(page - 1, 0)); }}
                                        className={page === 0 ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                                {paginationItems.map((item, idx) => (
                                    <PaginationItem key={idx}>
                                        {item === "..." ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <PaginationItem>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={page === item - 1}
                                                    onClick={(e) => { e.preventDefault(); onPageChange(item - 1); }}
                                                >
                                                    {item}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )}
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); onPageChange(Math.min(page + 1, totalPages - 1)); }}
                                        className={page === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

const MONTH_NAMES = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
] as const;

function toReportRows(reports: ReportResponse[], locale: string): TableRow[] {
    const dateLocale = locale === "vi" ? "vi-VN" : "en-US";
    return reports.map((r) => ({
        key: r.reportId,
        id: truncateId(r.reportId),
        name: r.name,
        createdDate: new Date(r.createdAt).toLocaleDateString(dateLocale),
        reportType: r.reportType,
        action: r.link,
    }));
}

export default function AdminReportsClient() {
    const { t, locale } = useLanguage();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortDirection] = useState<"ASC" | "DESC">("DESC");
    const [keyword, setKeyword] = useState("");
    const [reportTypeFilter, setReportTypeFilter] = useState<"all" | ReportType>("all");
    const [selectedActionLogId, setSelectedActionLogId] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Action Log Filters
    const [logPage, setLogPage] = useState(0);
    const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // Committed filter values (only change when Run is clicked)
    const [committedEntityType, setCommittedEntityType] = useState<string>("all");
    const [committedFromDate, setCommittedFromDate] = useState("");
    const [committedToDate, setCommittedToDate] = useState("");

    const reportParams = {
        page,
        size,
        sortBy,
        sortDirection,
        ...(reportTypeFilter === "all" ? {} : { reportType: reportTypeFilter }),
    };

    const reportQuery = useAdminReports(reportParams);
    const actionLogQuery = useAdminActionLogs({
        page: logPage,
        size,
        sortBy: "createdAt",
        sortDirection,
        action: committedEntityType === "all" ? undefined : committedEntityType,
        fromDate: committedFromDate || undefined,
        toDate: committedToDate || undefined,
    });
    const actionLogDetailQuery = useAdminActionLog(selectedActionLogId, Boolean(selectedActionLogId));

    // Fetch up to 1000 orders for aggregation
    const ordersQuery = useAdminOrders({ size: 1000, page: 0, sortBy: "orderDate", sortDirection: "DESC" });
    const productsQuery = useProducts({ size: 1000, page: 0 });

    const createMonthlyReport = useCreateMonthlyRevenueReport();
    const createTopSellingReport = useCreateTopSellingProductsReport();

    const orders = useMemo(() => ordersQuery.data?.items ?? [], [ordersQuery.data?.items]);
    const productMap = useMemo(() => {
        const map = new Map<string, string>();
        (productsQuery.data?.items ?? []).forEach(p => map.set(p.productId, p.name));
        return map;
    }, [productsQuery.data?.items]);

    const productPriceMap = useMemo(() => {
        const map = new Map<string, number>();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (productsQuery.data?.items ?? []).forEach(p => map.set(p.productId, p.displayPrice ?? (p as any).price ?? 0));
        return map;
    }, [productsQuery.data?.items]);

    const revenueData = useMemo(() => {
        const data = MONTH_NAMES.map(m => ({ month: m, revenue: 0 }));
        orders.forEach(o => {
            if (!o.orderDate) return;
            const date = new Date(o.orderDate);
            if (date.getFullYear() === selectedYear) {
                const monthIdx = date.getMonth();
                const target = data[monthIdx];
                if (target) {
                    target.revenue += o.totalAmount;
                }
            }
        });
        return data as { month: typeof MONTH_NAMES[number]; revenue: number }[];
    }, [orders, selectedYear]);

    useEffect(() => {
        if (ordersQuery.data) {
            const validOrders = orders.filter(o => o.orderDate && !isNaN(new Date(o.orderDate).getTime()));
            const yearOrders = validOrders.filter(o => new Date(o.orderDate).getFullYear() === selectedYear);
            // eslint-disable-next-line no-console
            console.log("[Revenue Debug]", {
                totalOrders: orders.length,
                withOrderDate: validOrders.length,
                inYear: yearOrders.length,
                selectedYear,
                sampleOrder: orders[0],
                revenueData,
            });
        }
    }, [orders, selectedYear, revenueData, ordersQuery.data]);

    // Log orders query errors for debugging
    useEffect(() => {
        if (ordersQuery.error) console.error("[Orders] fetch error:", ordersQuery.error);
        if (productsQuery.error) console.error("[Products] fetch error:", productsQuery.error);
    }, [ordersQuery.error, productsQuery.error]);

    const topSellingData = useMemo(() => {
        const counts = new Map<string, { totalSold: number; totalAmount: number; name: string; image?: string }>();
        orders.forEach(o => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (o.items as any[]).forEach(item => {
                const pid = item.productId;
                if (!pid) return;
                const current = counts.get(pid) || {
                    totalSold: 0,
                    totalAmount: 0,
                    name: item.name || productMap.get(pid) || truncateId(pid),
                    image: item.image || undefined,
                };
                current.totalSold += item.quantity || 0;
                current.totalAmount += (item.quantity || 0) * (productPriceMap.get(pid) ?? item.price ?? 0);
                if (!current.image && item.image) current.image = item.image;
                counts.set(pid, current);
            });
        });

        return Array.from(counts.entries())
            .map(([id, info]) => ({ id, ...info }))
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, 10);
    }, [orders, productMap, productPriceMap]);

    const handleCreateMonthlyReport = () => {
        createMonthlyReport.mutate({ reportItems: revenueData });
    };

    const handleCreateTopSellingReport = () => {
        createTopSellingReport.mutate({
            reportItems: topSellingData.map(d => ({ productId: d.id, productName: d.name, totalSold: d.totalSold }))
        });
    };

    const reports = useMemo(() => reportQuery.data?.items ?? [], [reportQuery.data?.items]);
    const filteredReports = useMemo(() => {
        const nk = keyword.trim().toLowerCase();
        return !nk ? reports : reports.filter((r) => r.name.toLowerCase().includes(nk) || r.reportId.toLowerCase().includes(nk));
    }, [keyword, reports]);
    const reportRows = useMemo(() => toReportRows(filteredReports, locale), [filteredReports, locale]);

    const actionLogRows = useMemo(() => (actionLogQuery.data?.items ?? []).map((r) => ({
        key: r.adminActionLogId,
        id: truncateId(r.adminActionLogId),
        action: r.action,
        createdDate: new Date(r.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US"),
        entityType: r.entityType,
        note: r.note,
    })), [actionLogQuery.data?.items, locale]);

    const dateLocale = locale === "vi" ? "vi-VN" : "en-US";

    const monthLabels = useMemo(() =>
        locale === "vi"
            ? ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"]
            : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        , [locale]);

    const isLoading = reportQuery.isLoading || actionLogQuery.isLoading;

    return (
        <div className="container mx-auto px-4 py-6 space-y-5">
            <div className="text-center space-y-1">
                <h1 className="text-xl font-bold flex items-center justify-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    {t("admin_reporting_management")}
                </h1>
                <p className="text-xs text-muted-foreground">
                    {t("admin_reports_subtitle")}
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
                <Select value={reportTypeFilter} onValueChange={(v) => setReportTypeFilter(v as "all" | ReportType)}>
                    <SelectTrigger className="h-9 min-w-36 text-sm rounded-xl">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {reportTypeOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                                {t(o.label)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <section className="grid lg:grid-cols-2 gap-5">
                <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-card to-muted/20">
                    <CardHeader className="pb-2 border-b border-border/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                {t("admin_top_selling_products")}
                            </CardTitle>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="h-7 text-tiny gap-1.5 rounded-full px-3"
                                onClick={handleCreateTopSellingReport}
                                disabled={createTopSellingReport.isPending || topSellingData.length === 0}
                            >
                                <Download className="h-3 w-3" />
                                {t("admin_generate_report")}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {ordersQuery.isLoading || productsQuery.isLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-32 w-full rounded-xl" />
                                <div className="flex gap-2 justify-center">
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-4 w-12 rounded-full" />)}
                                </div>
                            </div>
                        ) : topSellingData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground opacity-50">
                                <BarChart3 className="h-10 w-10 mb-2" />
                                <p className="text-xs font-medium">{t("admin_no_data")}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-medium">
                                            <th className="py-2 px-2 w-6">#</th>
                                            <th className="py-2 px-2 w-8"></th>
                                            <th className="py-2 px-2">{t("admin_product_name")}</th>
                                            <th className="py-2 px-2 text-right whitespace-nowrap">{t("sold")}</th>
                                            <th className="py-2 px-2 text-right whitespace-nowrap">{t("admin_total")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topSellingData.map((d, i) => (
                                            <tr key={d.id} className={`border-b border-border/30 hover:bg-accent/50 transition-colors ${i % 2 === 0 ? "bg-muted/20" : ""}`}>
                                                <td className="py-2 px-2 text-muted-foreground font-mono">{i + 1}</td>
                                                <td className="py-2 px-2">
                                                    {d.image ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={d.image} alt="" className="w-8 h-8 rounded object-cover border" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground text-tiny font-bold border">
                                                            {(d.name ?? "?").charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-2 px-2 font-medium truncate max-w-[160px]" title={d.name}>{d.name}</td>
                                                <td className="py-2 px-2 text-right font-mono tabular-nums">{new Intl.NumberFormat().format(d.totalSold)}</td>
                                                <td className="py-2 px-2 text-right font-mono tabular-nums text-primary font-semibold">
                                                    {new Intl.NumberFormat().format(d.totalAmount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-card to-muted/20">
                    <CardHeader className="pb-2 border-b border-border/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                {t("admin_monthly_revenue")}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center border rounded-full px-1.5 h-7 bg-background/50">
                                    <button
                                        type="button"
                                        className="p-1 hover:text-primary transition-colors"
                                        onClick={() => setSelectedYear(prev => prev - 1)}
                                    >
                                        <ChevronLeft className="h-3 w-3" />
                                    </button>
                                    <span className="text-tiny font-bold px-1 min-w-[34px] text-center">{selectedYear}</span>
                                    <button
                                        type="button"
                                        className="p-1 hover:text-primary transition-colors disabled:opacity-30"
                                        onClick={() => setSelectedYear(prev => prev + 1)}
                                        disabled={selectedYear >= new Date().getFullYear()}
                                    >
                                        <ChevronRight className="h-3 w-3" />
                                    </button>
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-7 text-tiny gap-1.5 rounded-full px-3"
                                    onClick={handleCreateMonthlyReport}
                                    disabled={createMonthlyReport.isPending || orders.length === 0}
                                >
                                    <Download className="h-3 w-3" />
                                    {t("admin_generate_report")}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {ordersQuery.isLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-32 w-full rounded-xl" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="overflow-x-auto max-h-52 overflow-y-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-medium">
                                                <th className="py-1.5 px-2">{t("admin_month")}</th>
                                                <th className="py-1.5 px-2 text-right">{t("admin_revenue")}</th>
                                                <th className="py-1.5 px-2 text-right w-16"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {revenueData.map((d, i) => {
                                                const label = monthLabels[MONTH_NAMES.indexOf(d.month)] ?? d.month.slice(0, 3);
                                                const prevRevenue = i > 0 ? revenueData[i - 1]!.revenue : d.revenue;
                                                const diff = d.revenue - prevRevenue;
                                                const trendIcon = i === 0 ? null : diff > 0 ? <ArrowUp className="h-3 w-3 text-emerald-500" /> : diff < 0 ? <ArrowDown className="h-3 w-3 text-red-500" /> : <span className="h-3 w-3 text-muted-foreground">–</span>;
                                                return (
                                                    <tr key={d.month} className={`border-b border-border/30 hover:bg-accent/50 transition-colors ${i % 2 === 0 ? "bg-muted/20" : ""}`}>
                                                        <td className="py-1.5 px-2 font-medium">{label}</td>
                                                        <td className={`py-1.5 px-2 text-right font-mono tabular-nums ${d.revenue > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                                                            {new Intl.NumberFormat().format(d.revenue)}
                                                        </td>
                                                        <td className="py-1.5 px-2 text-right">{trendIcon}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-border/30">
                                    <div className="flex flex-col">
                                        <span className="text-tiny text-muted-foreground uppercase font-bold tracking-wider">
                                            {t("admin_total_year_revenue")}
                                        </span>
                                        <span className="text-sm font-black text-primary">
                                            {new Intl.NumberFormat().format(revenueData.reduce((acc, curr) => acc + curr.revenue, 0))} VND
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5">
                                        <span className="text-tiny text-muted-foreground italic">
                                            {orders.length} {t("admin_orders_analyzed")}
                                        </span>
                                        {/* {orders.length > 0 && revenueData.every(d => d.revenue === 0) && (
                                            <span className="text-tiny text-destructive font-medium">
                                                {t("admin_revenue_debug")}
                                            </span>
                                        )} */}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>

            {isLoading ? (
                <Card>
                    <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
                    <CardContent className="space-y-3">
                        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
                    </CardContent>
                </Card>
            ) : (
                <ReportTable
                    title={t("admin_list_of_reports")}
                    rows={reportRows}
                    columns={[
                        { key: "id", label: t("admin_order_id") },
                        { key: "name", label: t("admin_report_name") },
                        { key: "createdDate", label: t("admin_created_date") },
                        { key: "reportType", label: t("admin_report_type") },
                        { key: "action", label: t("admin_download") },
                    ]}
                    page={page}
                    totalPages={reportQuery.data?.totalPages ?? 1}
                    onPageChange={setPage}
                    search={keyword}
                    onSearchChange={setKeyword}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                    size={size}
                    onSizeChange={(v) => { setPage(0); setSize(v); }}
                />
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <ListChecks className="h-4 w-4 text-primary" />
                        {t("admin_action_logs")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-3 rounded-xl border border-border/50">
                        <div className="w-full sm:w-40">
                            <label className="text-tiny font-bold text-muted-foreground uppercase ml-1 mb-1 block">
                                {t("admin_entity_type")}
                            </label>
                            <Select value={entityTypeFilter} onValueChange={(v) => { setEntityTypeFilter(v); }}>
                                <SelectTrigger className="h-9 rounded-lg bg-background">
                                    <SelectValue placeholder={t("admin_all")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {entityTypeOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {t(opt.label)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1 min-w-[200px] grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-tiny font-bold text-muted-foreground uppercase ml-1 mb-1 block">
                                    {t("from_date")}
                                </label>
                                <Input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => { setFromDate(e.target.value); }}
                                    className="h-9 rounded-lg bg-background"
                                />
                            </div>
                            <div>
                                <label className="text-tiny font-bold text-muted-foreground uppercase ml-1 mb-1 block">
                                    {t("to_date")}
                                </label>
                                <Input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => { setToDate(e.target.value); }}
                                    className="h-9 rounded-lg bg-background"
                                />
                            </div>
                        </div>

                        <div className="flex items-end h-9 pt-5 gap-2">
                            <Button
                                size="sm"
                                onClick={() => {
                                    setCommittedEntityType(entityTypeFilter);
                                    setCommittedFromDate(fromDate);
                                    setCommittedToDate(toDate);
                                    setLogPage(0);
                                }}
                                className="h-8 text-xs rounded-lg"
                            >
                                {t("admin_run")}
                            </Button>
                            {(entityTypeFilter !== "all" || fromDate || toDate) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setEntityTypeFilter("all");
                                        setFromDate("");
                                        setToDate("");
                                        setCommittedEntityType("all");
                                        setCommittedFromDate("");
                                        setCommittedToDate("");
                                        setLogPage(0);
                                    }}
                                    className="h-8 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    {t("clear_filters")}
                                </Button>
                            )}
                        </div>
                    </div>
                    {actionLogQuery.isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("admin_order_id")}</th>
                                            <th className="py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("admin_action")}</th>
                                            <th className="py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("admin_created_date")}</th>
                                            <th className="py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("admin_entity_type")}</th>
                                            <th className="py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("admin_note")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {actionLogRows.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                                                    {t("admin_no_action_logs")}
                                                </td>
                                            </tr>
                                        ) : (
                                            actionLogRows.map((row, i) => (
                                                <tr key={row.key} className={`transition-colors hover:bg-accent/50 ${i % 2 === 0 ? "bg-muted/30" : ""}`}>
                                                    <td className="py-2.5 px-3">
                                                        <button
                                                            type="button"
                                                            className="text-left font-mono text-xs underline-offset-2 hover:underline text-muted-foreground hover:text-foreground transition-colors"
                                                            onClick={() => setSelectedActionLogId(row.key)}
                                                        >
                                                            {row.id}
                                                        </button>
                                                    </td>
                                                    <td className="py-2.5 px-3">{row.action}</td>
                                                    <td className="py-2.5 px-3 text-muted-foreground">{row.createdDate}</td>
                                                    <td className="py-2.5 px-3">
                                                        <Badge variant="outline" className="rounded-full text-tiny font-normal">
                                                            {row.entityType}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-muted-foreground truncate max-w-[200px]">{row.note}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {actionLogQuery.data && actionLogQuery.data.totalPages > 1 && (
                                <div className="flex justify-center pt-2">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (logPage > 0) setLogPage(logPage - 1);
                                                    }}
                                                    className={logPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                            {[...Array(actionLogQuery.data.totalPages)].map((_, i) => {
                                                // Simple pagination: show current, first, last, and neighbors
                                                if (
                                                    i === 0 ||
                                                    i === actionLogQuery.data!.totalPages - 1 ||
                                                    (i >= logPage - 1 && i <= logPage + 1)
                                                ) {
                                                    return (
                                                        <PaginationItem key={i}>
                                                            <PaginationLink
                                                                href="#"
                                                                isActive={logPage === i}
                                                                onClick={(e) => { e.preventDefault(); setLogPage(i); }}
                                                            >
                                                                {i + 1}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    );
                                                }
                                                if (i === 1 || i === actionLogQuery.data!.totalPages - 2) {
                                                    return (
                                                        <PaginationItem key={i}>
                                                            <PaginationEllipsis />
                                                        </PaginationItem>
                                                    );
                                                }
                                                return null;
                                            })}
                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (logPage < actionLogQuery.data!.totalPages - 1) setLogPage(logPage + 1);
                                                    }}
                                                    className={logPage >= actionLogQuery.data!.totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}

                    {selectedActionLogId && (
                        <div className="mt-3 rounded-xl border bg-muted/50 p-4 text-sm">
                            {actionLogDetailQuery.isLoading ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <span>{t("loading")}</span>
                                </div>
                            ) : actionLogDetailQuery.data ? (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-foreground">{t("admin_action_log_detail")}:</span>
                                        <Badge variant="secondary" className="rounded-full text-tiny">{actionLogDetailQuery.data.action}</Badge>
                                    </div>
                                    <p className="text-muted-foreground pl-0">{actionLogDetailQuery.data.note}</p>
                                    <p className="text-xs text-muted-foreground pl-0">
                                        {actionLogDetailQuery.data.createdAt ? new Date(actionLogDetailQuery.data.createdAt).toLocaleString(dateLocale) : "-"}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">{t("order_not_found")}</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
