import type { ContactRequest, ContactResponse } from "./types";

import { post } from "@/api/client";
import type { ApiResponse } from "@/types";

/**
 * Gửi thông tin liên hệ từ form About
 * @param payload - Thông tin người liên hệ (tên, email, cty, tin nhắn,...)
 */
export async function submitContact(payload: ContactRequest): Promise<ContactResponse> {
  const response = await post<ApiResponse<ContactResponse>>("/api/contact", payload);
  return response.data;
}
