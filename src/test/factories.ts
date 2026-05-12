import type { AuthSession } from "@/features/auth/types";
import type { Order } from "@/features/orders/types";
import type { Product, Brand, Category } from "@/features/products/types";

export const createMockProduct = (overrides?: Partial<Product>): Product => ({
  productId: "prod-123",
  name: "Mock Product",
  description: "Mock Description",
  displayPrice: 100000,
  brand: "Mock Brand",
  category: "Mock Category",
  status: "AVAILABLE",
  variants: [],
  averageRating: 4.5,
  brandId: 1,
  categoryId: 1,
  ...overrides,
});

export const createMockOrder = (overrides?: Partial<Order>): Order => ({
  orderId: "order-123",
  orderDate: new Date().toISOString(),
  totalAmount: 500000,
  deliveryStatus: "PENDING",
  paymentMethod: "COD",
  addressId: "addr-123",
  customerId: "cust-123",
  updatedAt: new Date().toISOString(),
  items: [],
  ...overrides,
});

export const createMockAuthSession = (overrides?: Partial<AuthSession>): AuthSession => ({
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  user: {
    userId: "user-123",
    username: "mockuser",
    email: "mock@example.com",
    role: "CUSTOMER",
  },
  ...overrides,
});

export const createMockCategory = (overrides?: Partial<Category>): Category => ({
  categoryId: 1,
  name: "Electronics",
  ...overrides,
});

export const createMockBrand = (overrides?: Partial<Brand>): Brand => ({
  brandId: 1,
  name: "Apple",
  ...overrides,
});
