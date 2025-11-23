import { ReportEntitySchema } from "./report.entity";
import { z } from "zod";

export const ReportPublicSchema = ReportEntitySchema.omit({
  adminId: true,
});

export type ReportPublic = z.infer<typeof ReportPublicSchema>;
