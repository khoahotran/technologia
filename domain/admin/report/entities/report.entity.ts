import z from "zod";

import { ReportType } from "../vo";

import { BaseEntitySchema } from "@/shared/entities/base.entity";

export const ReportEntitySchema = BaseEntitySchema.extend({
  reportId: z.string(),
  reportType: ReportType,
  adminId: z.string(),
  name: z.string(),
  link: z.url(),
});

export type ReportEntity = z.infer<typeof ReportEntitySchema>;
