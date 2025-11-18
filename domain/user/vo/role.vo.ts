import { z } from "zod";

export const UserRoleSchema = z.enum(["ADMIN", "CUSTOMER"]);

export type UserRole = z.infer<typeof UserRoleSchema>;
