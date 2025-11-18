import { z } from "zod";

export const EmailSchema = z.email();

export type Email = z.infer<typeof EmailSchema>;
