import { z } from "zod";

export const PriceSchema = z.object({
  amount: z.number().min(0, "Amount must be greater than or equal to 0"),
  currency: z.string().length(3, "Currency must be 3 characters code (e.g. USD)"),
});
export type Price = z.infer<typeof PriceSchema>;

// Optional: Value Object class
export class PriceVO {
  private readonly value: Price;

  constructor(value: Price) {
    this.value = PriceSchema.parse(value);
  }

  getAmount(): number {
    return this.value.amount;
  }

  getCurrency(): string {
    return this.value.currency;
  }

  toString(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.value.currency
    }).format(this.value.amount);
  }
}
