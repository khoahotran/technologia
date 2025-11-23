import { ProductReportEntitySchema } from "./product-report.entity";
import { z } from "zod";

export const ProductReportPublicSchema =
  ProductReportEntitySchema;

export type ProductReportPublic = z.infer<
  typeof ProductReportPublicSchema
>;
