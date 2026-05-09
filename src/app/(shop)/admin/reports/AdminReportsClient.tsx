"use client";

import { BarChart3, ExternalLink, ListChecks, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
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
} from "@/features/admin/hooks";
import type { ReportResponse, ReportType } from "@/features/admin/types";
import { truncateId } from "@/features/orders/presentation";
import { useLanguage } from "@/providers/language.provider";

const reportTypeOptions: Array<{ value: "all" | ReportType; label: string }> = [
    { value: "all", label: "all" },
    { value: "MONTHLY_REVENUE", label: "monthly_revenue" },
    { value: "TOP_SELLING_PRODUCTS", label: "top_selling_products" },
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
                            placeholder={t("admin_search_here", {}, "Search Here")}
                            className="h-9 pl-9 text-sm rounded-xl"
                        />
                    </div>
                    <Select value={sortBy} onValueChange={onSortByChange}>
                        <SelectTrigger className="h-9 min-w-32 text-sm rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="createdAt">{t("admin_created_date", {}, "Created Date")}</SelectItem>
                            <SelectItem value="name">{t("admin_name", {}, "Name")}</SelectItem>
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
                                        {t("admin_no_reports", {}, "No reports found")}
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row, i) => (
                                    <tr key={row.key} className={`transition-colors hover:bg-accent/50 ${i % 2 === 0 ? "bg-muted/30" : ""}`}>
                                        {columns.map((col) => (
                                            <td key={col.key} className="py-2.5 px-3 border-r border-border/30 last:border-r-0 whitespace-nowrap">
                                                {col.key === "reportType" ? (
                                                    <Badge variant={getBadgeVariant(row[col.key])} className="rounded-full text-[10px] font-medium">
                                                        {row[col.key] === "MONTHLY_REVENUE"
                                                            ? t("monthly_revenue", {}, "Revenue")
                                                            : t("top_selling_products", {}, "Top selling")}
                                                    </Badge>
                                                ) : col.key === "action" ? (
                                                    <a
                                                        href={row[col.key]}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-primary hover:underline text-xs font-medium"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                        {t("admin_download", {}, "Download")}
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
                                            <PaginationLink
                                                href="#"
                                                isActive={page === item - 1}
                                                onClick={(e) => { e.preventDefault(); onPageChange(item - 1); }}
                                            >
                                                {item}
                                            </PaginationLink>
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

    const reportParams = {
        page,
        size,
        sortBy,
        sortDirection,
        ...(reportTypeFilter === "all" ? {} : { reportType: reportTypeFilter }),
    };
    const reportQuery = useAdminReports(reportParams);
    const actionLogQuery = useAdminActionLogs({
        page,
        size,
        sortBy: "createdAt",
        sortDirection,
    });
    const actionLogDetailQuery = useAdminActionLog(selectedActionLogId, Boolean(selectedActionLogId));

    const reports = useMemo(() => reportQuery.data?.items ?? [], [reportQuery.data?.items]);
    const filteredReports = useMemo(() => {
        const nk = keyword.trim().toLowerCase();
        return !nk ? reports : reports.filter((r) => r.name.toLowerCase().includes(nk) || r.reportId.toLowerCase().includes(nk));
    }, [keyword, reports]);
    const reportRows = useMemo(() => toReportRows(filteredReports, locale), [filteredReports, locale]);
    const topSellingReports = reports.filter((r) => r.reportType === "TOP_SELLING_PRODUCTS").slice(0, 10);

    const actionLogRows = useMemo(() => (actionLogQuery.data?.items ?? []).map((r) => ({
        key: r.adminActionLogId,
        id: truncateId(r.adminActionLogId),
        action: r.action,
        createdDate: new Date(r.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US"),
        entityType: r.entityType,
        note: r.note,
    })), [actionLogQuery.data?.items, locale]);

    const dateLocale = locale === "vi" ? "vi-VN" : "en-US";
    const isLoading = reportQuery.isLoading || actionLogQuery.isLoading;

    return (
        <div className="container mx-auto px-4 py-6 space-y-5">
            <div className="text-center space-y-1">
                <h1 className="text-xl font-bold flex items-center justify-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    {t("admin_reporting_management", {}, "Reporting Management")}
                </h1>
                <p className="text-xs text-muted-foreground">
                    {t("admin_reports_subtitle", {}, "View and manage system reports")}
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

            {/* <section className="grid lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            {t("admin_top_selling_products", {}, "Top-selling products")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
                            </div>
                        ) : topSellingReports.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">{t("admin_no_data", {}, "No data. Generate a report to see results.")}</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {topSellingReports.map((r, i) => (
                                    <div key={r.reportId} className="flex items-center justify-between py-2.5 text-sm">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-xs font-semibold text-muted-foreground w-5 shrink-0 text-right">
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                            <span className="truncate font-medium">{r.name}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground shrink-0 ml-3">
                                            {new Date(r.createdAt).toLocaleDateString(dateLocale)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            {t("admin_revenue_last_12_months", {}, "Revenue of the last 12 months")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">{t("admin_no_data", {}, "No data. Generate a report to see results.")}</p>
                        </div>
                    </CardContent>
                </Card>
            </section> */}

            {isLoading ? (
                <Card>
                    <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
                    <CardContent className="space-y-3">
                        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
                    </CardContent>
                </Card>
            ) : (
                <ReportTable
                    title={t("admin_list_of_reports", {}, "List of reports")}
                    rows={reportRows}
                    columns={[
                        { key: "id", label: t("admin_order_id", {}, "ID") },
                        { key: "name", label: t("admin_report_name", {}, "Report name") },
                        { key: "createdDate", label: t("admin_created_date", {}, "Created Date") },
                        { key: "reportType", label: t("admin_report_type", {}, "Report Type") },
                        { key: "action", label: t("admin_download", {}, "Download") },
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
                        {t("admin_action_logs", {}, "Admin action logs")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
                                            <th className="py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("admin_order_id", {}, "ID")}</th>
                                            <th className="py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("admin_action", {}, "Action")}</th>
                                            <th className="py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("admin_created_date", {}, "Created Date")}</th>
                                            <th className="py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("admin_entity_type", {}, "Entity Type")}</th>
                                            <th className="py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("admin_note", {}, "Note")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {actionLogRows.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                                                    {t("admin_no_action_logs", {}, "No action logs found")}
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
                                                        <Badge variant="outline" className="rounded-full text-[10px] font-normal">
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
                                <div className="flex justify-center pt-1">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); }}
                                                    className="pointer-events-none opacity-50"
                                                />
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationLink href="#" isActive>1</PaginationLink>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); }}
                                                    className="pointer-events-none opacity-50"
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
                                    <span>{t("loading", {}, "Loading...")}</span>
                                </div>
                            ) : actionLogDetailQuery.data ? (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-foreground">{t("admin_action_log_detail", {}, "Detail")}:</span>
                                        <Badge variant="secondary" className="rounded-full text-[10px]">{actionLogDetailQuery.data.action}</Badge>
                                    </div>
                                    <p className="text-muted-foreground pl-0">{actionLogDetailQuery.data.note}</p>
                                    <p className="text-xs text-muted-foreground pl-0">
                                        {new Date(actionLogDetailQuery.data.createdAt).toLocaleString(dateLocale)}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">{t("order_not_found", {}, "Not found")}</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
