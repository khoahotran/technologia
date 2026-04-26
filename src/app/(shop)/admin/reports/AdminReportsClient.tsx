"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { UnknownApiNotice } from "@/components/features/admin/UnknownApiNotice";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    useAdminReports,
    useCreateMonthlyRevenueReport,
    useCreateTopSellingProductsReport,
} from "@/features/admin/hooks";
import { ADMIN_UNKNOWN_API_MESSAGE } from "@/features/admin/service-adapter";
import type { ReportResponse, ReportType } from "@/features/admin/types";
import { useLanguage } from "@/providers/language.provider";

const monthRevenueSeed = [
    { month: "JANUARY", revenue: 260_000_000 },
    { month: "FEBRUARY", revenue: 230_000_000 },
    { month: "MARCH", revenue: 180_000_000 },
    { month: "APRIL", revenue: 250_000_000 },
    { month: "MAY", revenue: 180_000_000 },
    { month: "JUNE", revenue: 110_000_000 },
    { month: "JULY", revenue: 220_000_000 },
    { month: "AUGUST", revenue: 80_000_000 },
    { month: "SEPTEMBER", revenue: 140_000_000 },
    { month: "OCTOBER", revenue: 45_000_000 },
    { month: "NOVEMBER", revenue: 82_000_000 },
    { month: "DECEMBER", revenue: 135_000_000 },
] as const;

const reportTypeOptions: Array<{ value: "all" | ReportType; label: string }> = [
    { value: "all", label: "All" },
    { value: "MONTHLY_REVENUE", label: "Monthly Revenue" },
    { value: "TOP_SELLING_PRODUCTS", label: "Top Selling Products" },
];

const actionRows = Array.from({ length: 10 }).map((_, index) => ({
    id: "#Id",
    action: "action_placeholder",
    createdDate: "dd/mm/yyyy",
    entityType: "entity_type",
    note: "note_placeholder",
    key: `action-${index}`,
}));

type TableRow = {
    key: string;
    [field: string]: string;
};
type TableColumn = { key: string; label: string };

function ReportTable({
    title,
    rows,
    columns,
    stripedClass,
    accentClass,
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
    stripedClass: string;
    accentClass: string;
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

    return (
        <section className="bg-[#F8F8F8] rounded-xl p-8">
            <h3 className="text-3xl md:text-4xl font-semibold text-[#3B4F66] text-center mb-6">{title}</h3>
            <div className="grid md:grid-cols-[1fr_auto_auto] gap-4 mb-4">
                <div className="relative">
                    <Input
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder={t("admin_search_here", {}, "Search Here")}
                        className="h-[52px] pr-10 text-lg"
                    />
                    <Search className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-[#5E6A75]" />
                </div>
                <Select value={sortBy} onValueChange={onSortByChange}>
                    <SelectTrigger className="h-[52px] min-w-48 text-base md:text-lg">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="createdAt">{t("admin_created_date", {}, "Created Date")}</SelectItem>
                        <SelectItem value="name">{t("admin_name", {}, "Name")}</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={String(size)} onValueChange={(value) => onSizeChange(Number(value))}>
                    <SelectTrigger className="h-[52px] min-w-24 text-base md:text-lg">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm md:text-lg">
                    <thead>
                        <tr className="border-b border-[#ADC4D3]">
                            {columns.map((column) => (
                                <th key={column.key} className="py-3 px-3 capitalize font-medium">
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={row["key"]} className={index % 2 === 0 ? stripedClass : "bg-transparent"}>
                                {columns.map((column) => (
                                    <td key={column.key} className="py-3 px-3 border-r border-[#ADC4D3]/60 last:border-r-0">
                                        {row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center mt-8">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                className={accentClass}
                                onClick={(event) => {
                                    event.preventDefault();
                                    onPageChange(Math.max(page - 1, 0));
                                }}
                            />
                        </PaginationItem>
                        {[0, 1, 2].map((offset) => {
                            const nextPage = Math.min(Math.max(page + offset - 1, 0), Math.max(totalPages - 1, 0));
                            return (
                                <PaginationItem key={nextPage}>
                                    <PaginationLink
                                        href="#"
                                        className={accentClass}
                                        isActive={nextPage === page}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            onPageChange(nextPage);
                                        }}
                                    >
                                        {nextPage + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        })}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                className={accentClass}
                                onClick={(event) => {
                                    event.preventDefault();
                                    onPageChange(Math.min(page + 1, Math.max(totalPages - 1, 0)));
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </section>
    );
}

function toReportRows(reports: ReportResponse[]): TableRow[] {
    return reports.map((report) => ({
        key: report.reportId,
        id: report.reportId,
        name: report.name,
        createdDate: new Date(report.createdAt).toLocaleDateString("vi-VN"),
        reportType: report.reportType,
        action: report.link,
    }));
}

export default function AdminReportsClient() {
    const { t } = useLanguage();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortDirection] = useState<"ASC" | "DESC">("DESC");
    const [keyword, setKeyword] = useState("");
    const [reportTypeFilter, setReportTypeFilter] = useState<"all" | ReportType>("all");

    const createMonthlyRevenueMutation = useCreateMonthlyRevenueReport();
    const createTopSellingMutation = useCreateTopSellingProductsReport();
    const reportParams = {
        page,
        size,
        sortBy,
        sortDirection,
        ...(reportTypeFilter === "all" ? {} : { reportType: reportTypeFilter }),
    };
    const reportQuery = useAdminReports(reportParams);

    const reports = useMemo(() => reportQuery.data?.items ?? [], [reportQuery.data?.items]);
    const filteredReports = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();
        if (!normalizedKeyword) return reports;
        return reports.filter(
            (report) =>
                report.name.toLowerCase().includes(normalizedKeyword) ||
                report.reportId.toLowerCase().includes(normalizedKeyword)
        );
    }, [keyword, reports]);
    const reportRows = toReportRows(filteredReports);
    const topSellingRows = reports
        .filter((report) => report.reportType === "TOP_SELLING_PRODUCTS")
        .slice(0, 10);

    const monthRevenue = monthRevenueSeed.map((item) => ({
        month: item.month,
        value: Math.round(item.revenue / 1_000_000),
    }));
    const maxRevenue = Math.max(...monthRevenue.map((item) => item.value), 1);

    const actionLogRows = actionRows.map((row) => ({
        ...row,
        action: t("admin_action_placeholder", {}, "Actionnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn..."),
        entityType: t("admin_entity_type", {}, "entity type"),
        note: t("admin_note_placeholder", {}, "Noteeeeeeeeee"),
    }));

    return (
        <div className="container mx-auto px-4 py-10 space-y-10">
            <h1 className="text-center text-4xl md:text-5xl font-bold tracking-tight">
                {t("admin_reporting_management", {}, "REPORTING MANAGEMENT")}
            </h1>

            <div className="flex flex-wrap justify-center gap-3">
                <button
                    type="button"
                    className="h-11 px-4 rounded-full bg-[#3E93B3] text-white text-sm font-semibold disabled:opacity-60"
                    onClick={() => createMonthlyRevenueMutation.mutate({ reportItems: [...monthRevenueSeed] })}
                    disabled={createMonthlyRevenueMutation.isPending}
                >
                    {t("admin_create_monthly_revenue_report", {}, "Create monthly revenue report")}
                </button>
                <button
                    type="button"
                    className="h-11 px-4 rounded-full bg-[#3E93B3] text-white text-sm font-semibold disabled:opacity-60"
                    onClick={() =>
                        createTopSellingMutation.mutate({
                            reportItems: topSellingRows.slice(0, 5).map((item, index) => ({
                                productId: `${item.reportId}-${index}`,
                                productName: item.name,
                                totalSold: 100 - index * 5,
                            })),
                        })
                    }
                    disabled={createTopSellingMutation.isPending}
                >
                    {t("admin_create_top_selling_report", {}, "Create top selling report")}
                </button>
                <Select value={reportTypeFilter} onValueChange={(value) => setReportTypeFilter(value as "all" | ReportType)}>
                    <SelectTrigger className="h-11 min-w-52">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {reportTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <section className="grid lg:grid-cols-2 gap-8">
                <div className="bg-[#F8F8F8] rounded-xl p-8">
                    <h2 className="text-3xl md:text-4xl font-semibold text-[#3B4F66] text-center mb-6">
                        {t("admin_top_selling_products", {}, "Top-selling products")}
                    </h2>
                    <table className="w-full text-lg md:text-2xl">
                        <thead>
                            <tr className="text-left">
                                <th className="py-2">{t("admin_product_name", {}, "Product name")}</th>
                                <th className="py-2 text-right">{t("admin_total_quantity_sold", {}, "Total quantity sold")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topSellingRows.slice(0, 10).map((report, index) => (
                                <tr key={report.reportId}>
                                    <td className="py-3 truncate max-w-[300px]">{report.name}</td>
                                    <td className="py-3 text-right">{100 - index * 5}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-[#F8F8F8] rounded-xl p-8">
                    <h2 className="text-3xl md:text-4xl font-semibold text-[#3B4F66] text-center mb-6">
                        {t("admin_revenue_last_12_months", {}, "Revenue of the last 12 months")}
                    </h2>
                    <div className="space-y-4">
                        {monthRevenue.map((row) => (
                            <div key={row.month} className="grid grid-cols-[120px_1fr_auto] items-center gap-3 text-base md:text-xl">
                                <span>{row.month}</span>
                                <div className="h-7 bg-[#EDF2F5] relative">
                                    <div
                                        className="h-7 bg-[#8DB6E7]"
                                        style={{ width: `${(row.value / maxRevenue) * 100}%` }}
                                    />
                                </div>
                                <span>{row.value}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-right mt-4 text-base md:text-lg text-[#5E6A75]">
                        {t("admin_millions_vnd", {}, "Millions VND")}
                    </p>
                </div>
            </section>

            <ReportTable
                title={t("admin_list_of_reports", {}, "List of reports")}
                rows={reportRows}
                columns={[
                    { key: "id", label: "id" },
                    { key: "name", label: t("admin_report_name", {}, "Report name") },
                    { key: "createdDate", label: t("admin_created_date", {}, "Created Date") },
                    { key: "reportType", label: t("admin_report_type", {}, "Report Type") },
                    { key: "action", label: t("admin_download", {}, "Download") },
                ]}
                stripedClass="bg-[#C8DAE9]"
                accentClass="text-[#3E93B3] border-[#3E93B3]"
                page={page}
                totalPages={reportQuery.data?.totalPages ?? 1}
                onPageChange={setPage}
                search={keyword}
                onSearchChange={setKeyword}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                size={size}
                onSizeChange={(value) => {
                    setPage(0);
                    setSize(value);
                }}
            />

            <section className="bg-[#F8F8F8] rounded-xl p-8">
                <h3 className="text-3xl md:text-4xl font-semibold text-[#3B4F66] text-center mb-6">
                    {t("admin_action_logs", {}, "Admin action logs")}
                </h3>
                <div className="text-center mb-4">
                    <UnknownApiNotice text={ADMIN_UNKNOWN_API_MESSAGE} />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm md:text-lg">
                        <thead>
                            <tr className="border-b border-[#CBB48E]">
                                <th className="py-3 px-3">id</th>
                                <th className="py-3 px-3">{t("admin_action", {}, "Action")}</th>
                                <th className="py-3 px-3">{t("admin_created_date", {}, "Created Date")}</th>
                                <th className="py-3 px-3">{t("admin_entity_type", {}, "Entity Type")}</th>
                                <th className="py-3 px-3">{t("admin_note", {}, "Note")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actionLogRows.map((row, index) => (
                                <tr key={row.key} className={index % 2 === 0 ? "bg-[#EED8B7]" : "bg-transparent"}>
                                    <td className="py-3 px-3">{row.id}</td>
                                    <td className="py-3 px-3">{row.action}</td>
                                    <td className="py-3 px-3">{row.createdDate}</td>
                                    <td className="py-3 px-3">{row.entityType}</td>
                                    <td className="py-3 px-3">{row.note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
