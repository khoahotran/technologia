import type { z } from "zod";

import { ReportEntitySchema } from "./report.entity";

export const ReportPublicSchema = ReportEntitySchema.omit({
  adminId: true,
});

export type ReportPublic = z.infer<typeof ReportPublicSchema>;
