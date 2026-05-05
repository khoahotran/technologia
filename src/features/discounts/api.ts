import { get } from "@/api/client";
import type { ApiResponse } from "@/types";
import { DiscountResponse, DiscountResponseSchema } from "./types";
import { z } from "zod";

export async function getAllDiscounts(): Promise<DiscountResponse[]> {
  const response = await get<ApiResponse<DiscountResponse[]>>("/api/discounts");
  return z.array(DiscountResponseSchema).parse(response.data);
}

export async function getDiscountByCode(code: string): Promise<DiscountResponse | undefined> {
  const all = await getAllDiscounts();
  return all.find(d => d.code === code);
}
