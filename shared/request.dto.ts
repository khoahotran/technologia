
//
// ==========================
// Request DTO Template
// ==========================
//

import z from "zod";

/**
 * Generic template for request DTOs.
 * T: The shape of the request body payload
 */
export function createRequestSchema<T extends z.ZodTypeAny>(bodySchema: T) {
  return z.object({
    body: bodySchema.describe('The payload of the request.'),
    query: z.record(z.string(), z.string()).optional().describe('Query parameters of the request.'),
    params: z.record(z.string(), z.string()).optional().describe('Route parameters of the request.'),
    headers: z.record(z.string(), z.string()).optional().describe('Headers of the request.')
  });
}

/**
 * Type helper for request DTO
 */
export type RequestDto<T extends z.ZodTypeAny> = z.infer<ReturnType<typeof createRequestSchema<T>>>;

