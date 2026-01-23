import { z } from "zod";

export const CategoryEntitySchema = z.object({
    categoryId: z.number(),
    name: z.string(),
});

export type CategoryEntity = z.infer<typeof CategoryEntitySchema>;
