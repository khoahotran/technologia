import { z } from "zod";

import { userProfileSchema } from "@/src/domain/models/user.model";

export const createBaseResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.number(),
    message: z.string(),
    data: dataSchema,
  });

export const createPaginationBaseResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.number(),
    message: z.string(),
    data: dataSchema,
    page_number: z.number(),
    page_size: z.number(),
    count_items: z.number(),
    count_pages: z.number(),
  });

const loginPayloadSchema = z
  .object({
    accessToken: z.string().optional(),
    token: z.string().optional(),
    refreshToken: z.string(),
    userId: z.union([z.string(), z.number()]),
  })
  .transform((value) => ({
    accessToken: value.accessToken ?? value.token ?? "",
    refreshToken: value.refreshToken,
    userId: String(value.userId),
  }))
  .refine((value) => value.accessToken.length > 0, {
    message: "Missing access token in login response",
  });

const refreshPayloadSchema = z
  .object({
    accessToken: z.string().optional(),
    token: z.string().optional(),
    refreshToken: z.string().optional(),
  })
  .transform((value) => ({
    accessToken: value.accessToken ?? value.token ?? "",
    refreshToken: value.refreshToken,
  }))
  .refine((value) => value.accessToken.length > 0, {
    message: "Missing access token in refresh response",
  });

export const loginResponseSchema = createBaseResponseSchema(loginPayloadSchema);
export const refreshResponseSchema = createBaseResponseSchema(refreshPayloadSchema);
export const userProfileResponseSchema = createBaseResponseSchema(userProfileSchema);
