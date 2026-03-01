import { z } from "zod";

export const CategoryEntitySchema = z.object({
    categoryId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
    name: z.string(),
});

export type CategoryEntity = z.infer<typeof CategoryEntitySchema>;
