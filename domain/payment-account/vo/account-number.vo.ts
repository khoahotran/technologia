import z from "zod";

export const AccountNumberVO = z.string().regex(/^\d+$/, "Invalid account number");

export type AccountNumber = z.infer<typeof AccountNumberVO>;
