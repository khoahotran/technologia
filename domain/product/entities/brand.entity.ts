import { z } from "zod";

export const BrandEntitySchema = z.object({
    brandId: z.number(),
    name: z.string(),
});

export type BrandEntity = z.infer<typeof BrandEntitySchema>;
