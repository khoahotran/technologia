import { createSuccessResponseSchema } from "@/shared/response/response.dto";
import { z } from "zod";
import { PaymentAccountPublicSchema } from "../entities/payment-account-public.entity";

export const PaymentAccountResponseSchema =
  createSuccessResponseSchema(PaymentAccountPublicSchema);

export type PaymentAccountResponse = z.infer<
  typeof PaymentAccountResponseSchema
>;

export const PaginatedPaymentAccountsResponseSchema =
  createSuccessResponseSchema(
    z.object({
      data: z.array(PaymentAccountPublicSchema),
      pagination: z.object({
        currentPage: z.number(),
        totalItems: z.number(),
        hasNextPage: z.boolean(),
        hasPreviousPage: z.boolean(),
        limit: z.number(),
      }),
    })
  );

export type PaginatedPaymentAccountsResponse = z.infer<
  typeof PaginatedPaymentAccountsResponseSchema
>;
