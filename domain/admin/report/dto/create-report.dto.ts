import z from "zod";
import { ReportType } from "../vo";

export const CreateReportDtoSchema = z.object({
  reportType: ReportType,
  name: z.string(),
  link: z.url(),
  adminId: z.string(),
});

export type CreateReportDto = z.infer<typeof CreateReportDtoSchema>;
