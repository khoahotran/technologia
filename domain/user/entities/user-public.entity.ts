import { z } from "zod";
import { UserEntitySchema } from "./user.entity";

export const UserPublicSchema = UserEntitySchema.omit({
  passwordHash: true,
});

export type UserPublic = z.infer<typeof UserPublicSchema>;
