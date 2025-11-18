import z from "zod";

export const ProductReportEntitySchema = z.object({
  productId: z.string(),
  reportId: z.string(),
  revenue: z.number(),
  quantitySold: z.number(),
});

export type ProductReportEntity = z.infer<
  typeof ProductReportEntitySchema
>;
