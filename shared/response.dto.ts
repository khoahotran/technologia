import { z } from 'zod';

//
// ==========================
// Response DTO Template
// ==========================
//

/**
 * Base schema for all API responses
 */
export const responseBaseSchema = z.object({
  statusCode: z.number().int().describe('HTTP status code of the response.'),
  message: z.string().describe('Human-readable message about the response status.'),
  timestamp: z.string().datetime().describe('ISO 8601 timestamp of when the response was generated.'),
  url: z.string().url().describe('Original URL of the request.'),
  method: z.string().describe('HTTP method of the original request (GET, POST, etc.).'),
});

/**
 * Error response schema
 */
export const errorResponseSchema = responseBaseSchema.extend({
  success: z.literal(false).describe('Indicates that the request was not successful.'),
  error: z.any().optional().describe('Optional error details for debugging or client information.'),
});

export type ErrorResponseDto = z.infer<typeof errorResponseSchema>;

/**
 * Factory to create success response schema for a specific payload T
 */
export function createSuccessResponseSchema<T extends z.ZodTypeAny>(resultSchema: T) {
  return responseBaseSchema.extend({
    success: z.literal(true).describe('Indicates that the request was successful.'),
    result: resultSchema.describe('Payload of the successful response.'),
  });
}

/**
 * Factory to create a standard API response schema (success | error)
 */
export function createResponseSchema<T extends z.ZodTypeAny>(resultSchema: T) {
  return z.discriminatedUnion('success', [
    createSuccessResponseSchema(resultSchema),
    errorResponseSchema,
  ]);
}

/**
 * Type helper for response DTO
 */
export type ResponseDto<T extends z.ZodTypeAny> = z.infer<ReturnType<typeof createResponseSchema<T>>>;
