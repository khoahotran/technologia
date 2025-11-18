import z from "zod";
import { BaseEntitySchema } from "@/shared/entities/base.entity";
import { ReportType } from "../vo";

export const ReportEntitySchema = BaseEntitySchema.extend({
  reportId: z.string(),
  reportType: ReportType,
  adminId: z.string(),
  name: z.string(),
  link: z.url(),
});

export type ReportEntity = z.infer<typeof ReportEntitySchema>;
