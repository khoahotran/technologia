import { post } from "@/api/client";
import type { ApiResponse } from "@/types";

export async function subscribeEmail(email: string): Promise<ApiResponse<null>> {
  return await post<ApiResponse<null>>("/api/subscribe", { email });
}
