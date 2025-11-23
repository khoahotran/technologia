import { z } from "zod";

export const PriceSchema = z.number().min(0, "Price must be greater than or equal to 0");
export type Price = z.infer<typeof PriceSchema>;

// Optional: Value Object class
export class PriceVO {
  private readonly value: Price;

  constructor(value: number) {
    this.value = PriceSchema.parse(value); // validate ngay khi tạo VO
  }

  getAmount(): number {
    return this.value;
  }

  // có thể thêm methods như format, add, subtract, multiply...
  toString(): string {
    return this.value.toFixed(2);
  }
}
