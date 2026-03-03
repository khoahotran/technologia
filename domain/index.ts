/**
 * Domain Layer Index
 * Centralized exports for all domain entities, DTOs, and interfaces
 */

// ===========================================
// Product Domain
// ===========================================

// Entities
export * from "./product/entities";
export type { ProductVariantSchema, ProductEntitySchema } from "./product/entities/product.entity";
export type { FilterResponseEntitySchema } from "./product/entities/filter.entity";

// Repository Interfaces
export type {
    IProductRepository,
    ProductPagingResponse,
    ProductSearchParams,
    FilterProductResponse,
} from "./product/repositories/product.repository.interface";

// ===========================================
// Cart Domain
// ===========================================

export * from "./cart/entities/cart.entity";
export * from "./cart/repositories/cart.repository.interface";

// ===========================================
// User Domain
// ===========================================

// Entities
export * from "./user/entities";

// DTOs
export * from "./user/dto/auth.dto";

// Repository Interfaces
export type {
    IAuthRepository,
    AuthResponse,
} from "./user/repositories/auth.repository.interface";
