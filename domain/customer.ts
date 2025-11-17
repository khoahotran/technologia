import { BaseEntitySchema } from "@/shared/entities/base.entity";
import z from "zod";

export const roleEnum = z.enum(["CUSTOMER", "ADMIN"]);

export type Role = z.infer<typeof roleEnum>;

export const customerSchema = BaseEntitySchema.extend({
    userId: z.string(),
    username: z.string(),
    password: z.string(),
    phoneNumber: z.string().optional(),
    email: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    displayName: z.string().optional(),
    status: z.string().optional(),
    role: roleEnum.default("CUSTOMER"),
});

export type Customer = z.infer<typeof customerSchema>;