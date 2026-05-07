import { z } from "zod";

import { DiscountResponse, DiscountResponseSchema } from "./types";

import { get } from "@/api/client";
import type { ApiResponse } from "@/types";

export async function getAllDiscounts(): Promise<DiscountResponse[]> {
  const response = await get<ApiResponse<DiscountResponse[]>>("/api/discounts");
  return z.array(DiscountResponseSchema).parse(response.data);
}

export async function getUserDiscounts(): Promise<DiscountResponse[]> {
  const response = await get<ApiResponse<DiscountResponse[]>>("/api/discounts/of-user");
  return z.array(DiscountResponseSchema).parse(response.data);
}

export function isDiscountUsable(discount: DiscountResponse): boolean {
  if (discount.isActive === false) return false;
  if (discount.remainingUsage !== undefined && discount.remainingUsage <= 0) return false;
  
  const now = new Date();
  if (discount.availableAt) {
    const available = new Date(discount.availableAt);
    if (now < available) return false;
  }
  if (discount.expireAt) {
    const expired = new Date(discount.expireAt);
    if (now > expired) return false;
  }
  
  return true;
}

export async function getAvailableDiscounts(): Promise<DiscountResponse[]> {
  const all = await getAllDiscounts();
  return all.filter(isDiscountUsable);
}

export async function getDiscountByCode(code: string): Promise<DiscountResponse | undefined> {
  const available = await getAvailableDiscounts();
  return available.find(d => d.code === code);
}
