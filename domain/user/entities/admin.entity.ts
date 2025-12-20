import { z } from "zod";

import { UserEntitySchema } from "./user.entity";

export const AdminEntitySchema = UserEntitySchema.extend({
  level: z.number(),
});

export type AdminEntity = z.infer<typeof AdminEntitySchema>;
