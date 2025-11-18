import { z } from "zod";

export const ActionType = z.enum(["CREATE", "UPDATE", "DELETE", "LOCK", "APPROVE"]);
export type ActionType = z.infer<typeof ActionType>;
