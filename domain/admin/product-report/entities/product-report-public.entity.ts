import type { z } from "zod";

import { ProductReportEntitySchema } from "./product-report.entity";

export const ProductReportPublicSchema =
  ProductReportEntitySchema;

export type ProductReportPublic = z.infer<
  typeof ProductReportPublicSchema
>;
