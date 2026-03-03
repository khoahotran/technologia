import { z } from "zod";

import { PaymentAccountPublicSchema } from "../entities/payment-account-public.entity";

import { createSuccessResponseSchema } from "@/shared/response/response.dto";

/**
 * Bản phác thảo phản hồi cho một Tài khoản Thanh toán duy nhất.
 * Sử dụng wrapper chung để đảm bảo tính nhất quán trong báo cáo trạng thái API.
 */
export const PaymentAccountResponseSchema =
  createSuccessResponseSchema(PaymentAccountPublicSchema);

export type PaymentAccountResponse = z.infer<
  typeof PaymentAccountResponseSchema
>;

/**
 * Bản phác thảo phản hồi cho Danh sách Tài khoản Thanh toán có phân trang.
 * Bao gồm mảng các thực thể công khai và thông tin chi tiết về phân trang.
 */
export const PaginatedPaymentAccountsResponseSchema =
  createSuccessResponseSchema(
    z.object({
      /** Danh sách tài khoản thanh toán */
      data: z.array(PaymentAccountPublicSchema),
      /** Thông tin phân trang từ server */
      pagination: z.object({
        /** Trang hiện tại */
        currentPage: z.number(),
        /** Tổng số lượng phần tử trên toàn hệ thống */
        totalItems: z.number(),
        /** Có trang kế tiếp không */
        hasNextPage: z.boolean(),
        /** Có trang trước đó không */
        hasPreviousPage: z.boolean(),
        /** Số lượng giới hạn phần tử mỗi trang */
        limit: z.number(),
      }),
    })
  );

export type PaginatedPaymentAccountsResponse = z.infer<
  typeof PaginatedPaymentAccountsResponseSchema
>;
