import { z } from "zod";

/**
 * Value Object Schema for Price.
 * Validates that the amount is non-negative and the currency follows ISO 4217 standard (3 chars).
 */
export const PriceSchema = z.object({
  /** Numeric cost value, must be >= 0 */
  amount: z.number().min(0, "Amount must be greater than or equal to 0"),
  /** International 3-letter currency code (e.g. 'USD', 'VND') */
  currency: z.string().length(3, "Currency must be 3 characters code (e.g. USD)"),
});

/** TypeScript type inferred from the Price Schema */
export type Price = z.infer<typeof PriceSchema>;

/**
 * Domain Value Object for handling Price operations.
 * Encapsulates validation and formatting logic.
 */
export class PriceVO {
  /** Internal immutable state of the price */
  private readonly value: Price;

  /**
   * Constructs a validated PriceVO.
   * @throws {ZodError} If the provided value object violates PriceSchema rules.
   */
  constructor(value: Price) {
    this.value = PriceSchema.parse(value);
  }

  /** Gets the numeric portion of the price */
  getAmount(): number {
    return this.value.amount;
  }

  /** Gets the ISO currency code */
  getCurrency(): string {
    return this.value.currency;
  }

  /**
   * Formats the price for UI display using the system's locale settings.
   * @returns A string like '$1,234.56' or '₫1.234.567'
   */
  toString(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.value.currency
    }).format(this.value.amount);
  }
}
