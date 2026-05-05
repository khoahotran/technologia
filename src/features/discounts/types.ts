import { z } from 'zod';

export const DiscountResponseSchema = z.object({
    discountId: z.string().uuid(),
    createAt: z.string().optional(),
    availableAt: z.string().optional(),
    expireAt: z.string().optional(),
    code: z.string(),
    type: z.string(),
    scope: z.string(),
    discountValue: z.number(),
    description: z.string().optional(),
    name: z.string(),
    remainingUsage: z.number().optional(),
    maxUsagePerUser: z.number().optional(),
    minOrderValue: z.number().optional(),
    isActive: z.boolean().optional(),
});

export type DiscountResponse = z.infer<typeof DiscountResponseSchema>;
