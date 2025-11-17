import { z } from "zod";

export const BaseEntitySchema = z
  .object({
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().optional(),
  })
  .required();

export type BaseEntity = z.infer<typeof BaseEntitySchema>;
