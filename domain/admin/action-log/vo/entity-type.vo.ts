import z from "zod";

export const EntityType = z.enum([
    "USER",
    "PRODUCT",
    "ORDER",
    "PAYMENT_ACCOUNT",
    "REPORT",
  ]);
  