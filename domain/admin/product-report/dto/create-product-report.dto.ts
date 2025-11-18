import z from "zod";

export const CreateProductReportDtoSchema = z.object({
  productId: z.string(),
  reportId: z.string(),
  revenue: z.number(),
  quantitySold: z.number(),
});

export type CreateProductReportDto = z.infer<
  typeof CreateProductReportDtoSchema
>;
