import { z } from "zod";

export const ApiEnvelopeSchema = z.object({
  status: z.number().optional().default(200),
  message: z.string().optional().default("Success"),
  data: z.unknown(),
});

export const PaginatedApiEnvelopeSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.array(z.unknown()),
  page_number: z.number(),
  page_size: z.number(),
  count_items: z.number(),
  count_pages: z.number(),
});

export const LoginContractSchema = z.object({
  status: z.number().optional(),
  message: z.string().optional(),
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    userId: z.union([z.string(), z.number()]).transform(String),
  }),
});

export const RefreshTokenContractSchema = z.object({
  status: z.number().optional(),
  message: z.string().optional(),
  data: z.object({
    accessToken: z.string().optional(),
    token: z.string().optional(),
    refreshToken: z.string().optional(),
  }),
});
