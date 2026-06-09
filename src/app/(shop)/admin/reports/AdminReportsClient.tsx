"use client";

import {
    ArrowDown,
    ArrowUp,
    BarChart3,
    Box,
    Calendar,
    ChevronDown,
    ChevronRight,
    Download,
    ExternalLink,
    FileText,
    ListChecks,
    Package,
    RefreshCw,
    Search,
    TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { SmallLoading } from "@/components/shared/loading";
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
    useCreateReport,
    useMonthlyRevenue,
    useProductRevenueOfMonth,
    useTopSellingProducts,
} from "@/features/admin/hooks";
import type { MonthlyRevenueResponse, ProductRevenueItem, ReportResponse, TopSellingProductResponse } from "@/features/admin/types";
import { truncateId } from "@/features/orders/presentation";
import { useLanguage } from "@/providers/language.provider";
import { useProductDetail } from "@/features/products/hooks";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a "YYYY-MM" string from a Date. */
function toYearMonth(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Default range: last 12 months */
function defaultRange(): { from: string; to: string } {
    const now = new Date();
    const to = toYearMonth(now);
    console.log("🚀 ~ defaultRange ~ to:", to)
    const fromDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const from = toYearMonth(fromDate);
    console.log("🚀 ~ defaultRange ~ from:", from)
    
    return { from, to };
}

function formatMoney(value: number, locale = "vi-VN"): string {
    return new Intl.NumberFormat(locale).format(value);
}

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

function toReportRows(reports: ReportResponse[], locale: string) {
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

function TopSellingRow({ item, index, dateLocale }: { item: TopSellingProductResponse; index: number; dateLocale: string }) {
    const { data: product, isLoading } = useProductDetail(item.productId);
    const { t } = useLanguage();
    
    // Default values if product data hasn't loaded or failed
    let revenue = item.totalRevenue ?? 0;
    let imageUrl = item.imageUrl;
    let productName = item.productName;

    if (product) {
        const firstVariant = product.variants?.[0];
        const basePrice = firstVariant ? (firstVariant.priceAfterDiscount ?? firstVariant.price) : product.displayPrice ?? 0;
        revenue = basePrice * item.totalSold;
        imageUrl = firstVariant?.images?.[0] ?? item.imageUrl;
        productName = product.name ?? item.productName;
    }

    return (
        <tr className={`border-b border-border/30 hover:bg-accent/50 transition-colors ${index % 2 === 0 ? "bg-muted/20" : ""}`}>
            <td className="py-2 px-2 text-muted-foreground font-mono">{index + 1}</td>
            <td className="py-2 px-2">
                <div className="flex items-center gap-2">
                    {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageUrl} alt="" className="w-7 h-7 rounded object-cover border shrink-0" />
                    ) : (
                        <div className="w-7 h-7 rounded bg-muted flex items-center justify-center text-muted-foreground text-tiny font-bold border shrink-0">
                            <Box className="h-3 w-3" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[120px]" title={productName}>
                            {productName || truncateId(item.productId)}
                        </span>
                        {isLoading && <span className="text-tiny text-muted-foreground animate-pulse">{t("loading", {}, "Loading...")}</span>}
                    </div>
                </div>
            </td>
            <td className="py-2 px-2 text-right font-mono tabular-nums">
                {new Intl.NumberFormat().format(item.totalSold)}
            </td>
            <td className="py-2 px-2 text-right font-mono tabular-nums text-primary font-semibold">
                {isLoading ? (
                    <SmallLoading className="h-3 w-3 inline" />
                ) : (
                    formatMoney(revenue, dateLocale)
                )}
            </td>
        </tr>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Expandable row that lazily fetches product revenue for a month on click. */
function MonthRevenueRow({
    item,
    idx,
    monthLabels,
    revenueData,
    locale,
}: {
    item: MonthlyRevenueResponse;
    idx: number;
    monthLabels: string[];
    revenueData: MonthlyRevenueResponse[];
    locale: string;
}) {
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState(false);
    const { data: productRevenue, isLoading: isLoadingProducts } = useProductRevenueOfMonth(
        item.month,
        expanded
    );

    const prevRevenue = idx > 0 ? revenueData[idx - 1]!.revenue : item.revenue;
    const diff = item.revenue - prevRevenue;
    const trendIcon =
        idx === 0
            ? null
            : diff > 0
            ? <ArrowUp className="h-3 w-3 text-emerald-500 inline" />
            : diff < 0
            ? <ArrowDown className="h-3 w-3 text-red-500 inline" />
            : <span className="h-3 w-3 text-muted-foreground inline">–</span>;

    const shortLabel = monthLabels[idx] ?? item.month;

    return (
        <>
            <tr
                className={`border-b border-border/30 transition-colors hover:bg-accent/50 cursor-pointer ${
                    idx % 2 === 0 ? "bg-muted/20" : ""
                } ${expanded ? "bg-accent/30" : ""}`}
                onClick={() => setExpanded((v) => !v)}
            >
                <td className="py-1.5 px-2 font-medium flex items-center gap-1">
                    {expanded
                        ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                        : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                    {shortLabel}
                    <span className="text-tiny text-muted-foreground font-normal ml-1">({item.month})</span>
                </td>
                <td className={`py-1.5 px-2 text-right font-mono tabular-nums ${item.revenue > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                    {formatMoney(item.revenue, locale === "vi" ? "vi-VN" : "en-US")}
                </td>
                <td className="py-1.5 px-2 text-right">{trendIcon}</td>
            </tr>

            {expanded && (
                <tr className="bg-accent/10 border-b border-border/30">
                    <td colSpan={3} className="py-2 px-4">
                        {isLoadingProducts ? (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                                <SmallLoading className="h-3 w-3" />
                                {t("loading", {}, "Loading products…")}
                            </div>
                        ) : !productRevenue || productRevenue.products.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic py-1">
                                {t("admin_no_products_this_month", {}, "No product data for this month.")}
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs mt-1 mb-1">
                                    <thead>
                                        <tr className="text-muted-foreground uppercase tracking-wider font-medium border-b border-border/40">
                                            <th className="py-1 px-2">{t("admin_product_name", {}, "Product")}</th>
                                            <th className="py-1 px-2">{t("variant", {}, "Variant")}</th>
                                            <th className="py-1 px-2 text-right">{t("sold", {}, "Sold")}</th>
                                            <th className="py-1 px-2 text-right">{t("admin_revenue", {}, "Revenue")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productRevenue.products.slice(0, 20).map((p: ProductRevenueItem) => (
                                            <tr key={`${p.productId}-${p.variantId}`} className="border-b border-border/20 hover:bg-accent/30">
                                                <td className="py-1 px-2 font-medium truncate max-w-[140px]" title={p.productName}>
                                                    {p.productName || truncateId(p.productId)}
                                                </td>
                                                <td className="py-1 px-2 text-muted-foreground">
                                                    {[p.color, p.storage].filter(Boolean).join(" / ") || "—"}
                                                </td>
                                                <td className="py-1 px-2 text-right font-mono tabular-nums">
                                                    {new Intl.NumberFormat().format(p.quantitySold)}
                                                </td>
                                                <td className="py-1 px-2 text-right font-mono tabular-nums text-primary font-semibold">
                                                    {formatMoney(p.revenue, locale === "vi" ? "vi-VN" : "en-US")}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {productRevenue.products.length > 20 && (
                                    <p className="text-tiny text-muted-foreground px-2 pb-1">
                                        +{productRevenue.products.length - 20} {t("admin_more_products", {}, "more products...")}
                                    </p>
                                )}
                            </div>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
}

/** Report list table with search, sort and pagination. */
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
    rows: ReturnType<typeof toReportRows>;
    columns: { key: string; label: string }[];
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
                                    <th
                                        key={col.key}
                                        className="py-2.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap"
                                    >
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
                                    <tr
                                        key={row.key}
                                        className={`transition-colors hover:bg-accent/50 ${i % 2 === 0 ? "bg-muted/30" : ""}`}
                                    >
                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                className="py-2.5 px-3 border-r border-border/30 last:border-r-0 whitespace-nowrap"
                                            >
                                                {col.key === "reportType" ? (
                                                    <Badge variant="info" className="rounded-full text-tiny font-medium">
                                                        {t("monthly_revenue", {}, "Monthly Revenue")}
                                                    </Badge>
                                                ) : col.key === "action" ? (
                                                    row[col.key] ? (
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
                                                        <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                                                            <SmallLoading className="h-3 w-3" />
                                                            {t("processing", {}, "Processing…")}
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className={col.key === "id" ? "font-mono text-xs text-muted-foreground" : ""}>
                                                        {row[col.key as keyof typeof row]}
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
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onPageChange(Math.max(page - 1, 0));
                                        }}
                                        className={page === 0 ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                                {paginationItems.map((item, idx) => (
                                    <PaginationItem key={idx}>
                                        {item === "..." ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <PaginationLink
                                                href="#"
                                                isActive={page === item - 1}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    onPageChange(item - 1);
                                                }}
                                            >
                                                {item}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onPageChange(Math.min(page + 1, totalPages - 1));
                                        }}
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

// ─── Entity type options for action log filter ────────────────────────────────

const entityTypeOptions = [
    { value: "all", label: "admin_status_all" },
    { value: "ORDER", label: "admin_orders" },
    { value: "PRODUCT", label: "admin_products" },
    { value: "CATEGORY", label: "admin_categories" },
    { value: "BRAND", label: "admin_brands" },
    { value: "DISCOUNT", label: "admin_discounts" },
];

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function AdminReportsClient() {
    const { t, locale } = useLanguage();
    const dateLocale = locale === "vi" ? "vi-VN" : "en-US";

    // ── Report list state ──────────────────────────────────────────────────
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortDirection] = useState<"ASC" | "DESC">("DESC");
    const [keyword, setKeyword] = useState("");

    // ── Revenue range state ────────────────────────────────────────────────
    const [rangeFrom, setRangeFrom] = useState(defaultRange().from);
    const [rangeTo, setRangeTo] = useState(defaultRange().to);

    // ── Action log state ───────────────────────────────────────────────────
    const [selectedActionLogId, setSelectedActionLogId] = useState("");
    const [logPage, setLogPage] = useState(0);
    const [entityTypeFilter, setEntityTypeFilter] = useState("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [committedEntityType, setCommittedEntityType] = useState("all");
    const [committedFromDate, setCommittedFromDate] = useState("");
    const [committedToDate, setCommittedToDate] = useState("");

    // ── Queries ────────────────────────────────────────────────────────────
    const revenueQuery = useMonthlyRevenue({ from: rangeFrom, to: rangeTo });
    const topSellingQuery = useTopSellingProducts(10);

    const reportParams = { page, size, sortBy, sortDirection };
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

    const createReport = useCreateReport();

    // ── Derived data ───────────────────────────────────────────────────────
    const revenueData: MonthlyRevenueResponse[] = revenueQuery.data ?? [];

    const totalRevenue = useMemo(
        () => revenueData.reduce((acc, r) => acc + (r.revenue ?? 0), 0),
        [revenueData]
    );

    const monthLabels = useMemo(
        () =>
            revenueData.map((r) => {
                const [year, month] = r.month.split("-");
                const d = new Date(Number(year), Number(month) - 1);
                return d.toLocaleString(dateLocale, { month: "short", year: "2-digit" });
            }),
        [revenueData, dateLocale]
    );

    const topSelling = topSellingQuery.data ?? [];

    const reports = useMemo(() => reportQuery.data?.items ?? [], [reportQuery.data]);
    const filteredReports = useMemo(() => {
        const nk = keyword.trim().toLowerCase();
        return !nk ? reports : reports.filter((r) => r.name.toLowerCase().includes(nk) || r.reportId.toLowerCase().includes(nk));
    }, [keyword, reports]);
    const reportRows = useMemo(() => toReportRows(filteredReports, locale), [filteredReports, locale]);

    const actionLogRows = useMemo(
        () =>
            (actionLogQuery.data?.items ?? []).map((r) => ({
                key: r.adminActionLogId,
                id: truncateId(r.adminActionLogId),
                action: r.action,
                createdDate: new Date(r.createdAt).toLocaleDateString(dateLocale),
                entityType: r.entityType,
                note: r.note,
            })),
        [actionLogQuery.data, dateLocale]
    );

    const isReportListLoading = reportQuery.isLoading || actionLogQuery.isLoading;

    // Auto-refresh report list while a report is being generated
    useEffect(() => {
        if (!createReport.isPending) return;
        const interval = setInterval(() => {
            reportQuery.refetch();
        }, 10_000);
        return () => clearInterval(interval);
    }, [createReport.isPending, reportQuery]);

    return (
        <div className="container mx-auto px-4 py-6 space-y-5">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="text-center space-y-1">
                <h1 className="text-xl font-bold flex items-center justify-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    {t("admin_reporting_management")}
                </h1>
                <p className="text-xs text-muted-foreground">{t("admin_reports_subtitle")}</p>
            </div>

            {/* ── Month Range Picker + Generate Button ────────────────────── */}
            <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/20">
                <CardHeader className="pb-2 border-b border-border/50">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            {t("admin_report_range", {}, "Report Date Range")}
                        </CardTitle>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 text-xs gap-1.5 rounded-full px-4"
                            onClick={() => createReport.mutate({ from: rangeFrom, to: rangeTo })}
                            disabled={createReport.isPending || !rangeFrom || !rangeTo}
                        >
                            {createReport.isPending ? (
                                <SmallLoading className="h-3 w-3" />
                            ) : (
                                <Download className="h-3 w-3" />
                            )}
                            {createReport.isPending
                                ? t("admin_generating", {}, "Generating…")
                                : t("admin_generate_report", {}, "Generate Report")}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-tiny font-bold text-muted-foreground uppercase ml-0.5">
                                {t("from_date", {}, "From")}
                            </label>
                            <Input
                                type="text"
                                placeholder="YYYY-MM"
                                value={rangeFrom}
                                onChange={(e) => {
                                    let val = e.target.value.replace(/[^0-9]/g, '');
                                    if (val.length > 4) val = val.slice(0, 4) + '-' + val.slice(4, 6);
                                    setRangeFrom(val);
                                }}
                                className="h-9 w-32 rounded-lg bg-background"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-tiny font-bold text-muted-foreground uppercase ml-0.5">
                                {t("to_date", {}, "To")}
                            </label>
                            <Input
                                type="text"
                                placeholder="YYYY-MM"
                                value={rangeTo}
                                onChange={(e) => {
                                    let val = e.target.value.replace(/[^0-9]/g, '');
                                    if (val.length > 4) val = val.slice(0, 4) + '-' + val.slice(4, 6);
                                    setRangeTo(val);
                                }}
                                className="h-9 w-32 rounded-lg bg-background"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5 text-xs rounded-lg"
                            onClick={() => revenueQuery.refetch()}
                            disabled={revenueQuery.isFetching}
                        >
                            <RefreshCw className={`h-3 w-3 ${revenueQuery.isFetching ? "animate-spin" : ""}`} />
                            {t("refresh", {}, "Refresh")}
                        </Button>
                        <div className="flex flex-col ml-auto text-right">
                            <span className="text-tiny text-muted-foreground uppercase font-bold tracking-wider">
                                {t("admin_total_year_revenue", {}, "Total Revenue")}
                            </span>
                            <span className="text-sm font-black text-primary">
                                {formatMoney(totalRevenue, dateLocale)} VND
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Revenue + Top Selling (side by side) ───────────────────── */}
            <section className="grid lg:grid-cols-2 gap-5">
                {/* Revenue table with drill-down */}
                <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-card to-muted/20">
                    <CardHeader className="pb-2 border-b border-border/50">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            {t("admin_monthly_revenue", {}, "Monthly Revenue")}
                            <span className="text-tiny font-normal text-muted-foreground ml-1">
                                ({t("click_to_expand", {}, "click row for product detail")})
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {revenueQuery.isLoading ? (
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-full rounded" />)}
                            </div>
                        ) : revenueQuery.isError ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                                <BarChart3 className="h-8 w-8 opacity-30" />
                                <p className="text-xs">{t("admin_revenue_load_error", {}, "Failed to load revenue data.")}</p>
                                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => revenueQuery.refetch()}>
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    {t("retry", {}, "Retry")}
                                </Button>
                            </div>
                        ) : revenueData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground opacity-50">
                                <BarChart3 className="h-8 w-8 mb-2" />
                                <p className="text-xs font-medium">{t("admin_no_data", {}, "No data")}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto max-h-80 overflow-y-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="sticky top-0 bg-card z-10">
                                        <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-medium">
                                            <th className="py-1.5 px-2">{t("admin_month", {}, "Month")}</th>
                                            <th className="py-1.5 px-2 text-right">{t("admin_revenue", {}, "Revenue")}</th>
                                            <th className="py-1.5 px-2 text-right w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {revenueData.map((item, idx) => (
                                            <MonthRevenueRow
                                                key={item.month}
                                                item={item}
                                                idx={idx}
                                                monthLabels={monthLabels}
                                                revenueData={revenueData}
                                                locale={locale}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Selling Products */}
                <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-card to-muted/20">
                    <CardHeader className="pb-2 border-b border-border/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                {t("admin_top_selling_products", {}, "Top Selling Products")}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-tiny gap-1 text-muted-foreground"
                                onClick={() => topSellingQuery.refetch()}
                                disabled={topSellingQuery.isFetching}
                            >
                                <RefreshCw className={`h-3 w-3 ${topSellingQuery.isFetching ? "animate-spin" : ""}`} />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {topSellingQuery.isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
                            </div>
                        ) : topSellingQuery.isError ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                                <TrendingUp className="h-8 w-8 opacity-30" />
                                <p className="text-xs">{t("admin_top_selling_load_error", {}, "Failed to load top selling data.")}</p>
                                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => topSellingQuery.refetch()}>
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    {t("retry", {}, "Retry")}
                                </Button>
                            </div>
                        ) : topSelling.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground opacity-50">
                                <Package className="h-8 w-8 mb-2" />
                                <p className="text-xs font-medium">{t("admin_no_data", {}, "No data")}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto max-h-80 overflow-y-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="sticky top-0 bg-card z-10">
                                        <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-medium">
                                            <th className="py-2 px-2 w-6">#</th>
                                            <th className="py-2 px-2">{t("admin_product_name", {}, "Product")}</th>
                                            <th className="py-2 px-2 text-right whitespace-nowrap">{t("sold", {}, "Sold")}</th>
                                            <th className="py-2 px-2 text-right whitespace-nowrap">{t("admin_revenue", {}, "Revenue")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topSelling.map((d, i) => (
                                            <TopSellingRow key={d.productId} item={d} index={i} dateLocale={dateLocale} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* ── Report List ────────────────────────────────────────────── */}
            {isReportListLoading ? (
                <Card>
                    <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
                    <CardContent className="space-y-3">
                        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
                    </CardContent>
                </Card>
            ) : (
                <ReportTable
                    title={t("admin_list_of_reports", {}, "Reports")}
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

            {/* ── Action Logs ────────────────────────────────────────────── */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <ListChecks className="h-4 w-4 text-primary" />
                        {t("admin_action_logs", {}, "Action Logs")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-3 rounded-xl border border-border/50">
                        <div className="w-full sm:w-40">
                            <label className="text-tiny font-bold text-muted-foreground uppercase ml-1 mb-1 block">
                                {t("admin_entity_type")}
                            </label>
                            <Select value={entityTypeFilter} onValueChange={(v) => setEntityTypeFilter(v)}>
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
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="h-9 rounded-lg bg-background [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            </div>
                            <div>
                                <label className="text-tiny font-bold text-muted-foreground uppercase ml-1 mb-1 block">
                                    {t("to_date")}
                                </label>
                                <Input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="h-9 rounded-lg bg-background [&::-webkit-calendar-picker-indicator]:invert"
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
                                                <tr
                                                    key={row.key}
                                                    className={`transition-colors hover:bg-accent/50 ${i % 2 === 0 ? "bg-muted/30" : ""}`}
                                                >
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
                                                    onClick={(e) => { e.preventDefault(); if (logPage > 0) setLogPage(logPage - 1); }}
                                                    className={logPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                            {[...Array(actionLogQuery.data.totalPages)].map((_, i) => (
                                                <PaginationItem key={i}>
                                                    <PaginationLink
                                                        href="#"
                                                        isActive={logPage === i}
                                                        onClick={(e) => { e.preventDefault(); setLogPage(i); }}
                                                    >
                                                        {i + 1}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}
                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (logPage < actionLogQuery.data!.totalPages - 1) setLogPage(logPage + 1);
                                                    }}
                                                    className={logPage === actionLogQuery.data.totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}

                            {/* Action log detail panel */}
                            {selectedActionLogId && actionLogDetailQuery.data && (
                                <div className="mt-2 p-4 bg-muted/30 rounded-xl border border-border/50 text-xs space-y-1">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold text-sm">{t("admin_log_detail", {}, "Log Detail")}</span>
                                        <button
                                            type="button"
                                            className="text-muted-foreground hover:text-foreground"
                                            onClick={() => setSelectedActionLogId("")}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    {Object.entries(actionLogDetailQuery.data).map(([k, v]) => (
                                        <div key={k} className="flex gap-2">
                                            <span className="text-muted-foreground capitalize min-w-[120px]">{k}:</span>
                                            <span className="font-mono break-all">{String(v)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
