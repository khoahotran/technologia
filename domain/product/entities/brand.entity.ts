import { z } from "zod";

export const BrandEntitySchema = z.object({
    brandId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
    name: z.string(),
});

export type BrandEntity = z.infer<typeof BrandEntitySchema>;
