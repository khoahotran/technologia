import z from "zod";

export const ReportType = z.enum([
  "PRODUCT_STAT",
  "USER_STAT",
  "REVENUE_SUMMARY",
  "CUSTOM_REPORT",
]);
