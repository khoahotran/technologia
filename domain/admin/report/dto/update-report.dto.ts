import z from "zod";

import { ReportType } from "../vo";

export const UpdateReportDtoSchema = z.object({
  reportType: ReportType.optional(),
  name: z.string().optional(),
  link: z.url().optional(),
});

export type UpdateReportDto = z.infer<typeof UpdateReportDtoSchema>;
