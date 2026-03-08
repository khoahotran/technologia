export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
  },
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (params: Record<string, unknown>) =>
      [...queryKeys.products.lists(), params] as const,
    detail: (id: string | number) =>
      [...queryKeys.products.all, "detail", id] as const,
  },
  cart: {
    all: ["cart"] as const,
    detail: () => [...queryKeys.cart.all, "detail"] as const,
    price: (cartItemIds: readonly string[]) =>
      [...queryKeys.cart.all, "price", ...cartItemIds] as const,
  },
} as const;
