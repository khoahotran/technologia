/**
 * Lược đồ Phản hồi API (API Response Schemas)
 *
 * Mở khai báo Zod schemas để thẩm định mạnh (validate) TẤT CẢ bộ dữ liệu trả về từ API backend.
 * Khẳng định type safety (an toàn kiểu dữ liệu) ngay lúc runtime (thời gian chạy) 
 * trước khi đổ ra UI. Nếu API backend trả sai cấu trúc sẽ bị bắt lỗi ngay ở bước này.
 *
 * Dựa trên tài liệu Backend API:
 * - Product Service: http://localhost:8082
 * - User Service: http://localhost:8081
 * - Cart Service: http://localhost:8083
 */

import { z } from 'zod';

// ===========================================
// Cấu trúc Phản hồi Gốc (Base Response Structure)
// ===========================================

/**
 * Khuôn mẫu Wrapper tiêu chuẩn cho tất cả những API response
 * Mọi backend endpoints phải tuân thủ dạng { status, message, data }
 */
export const BaseResponseSchema = z.object({
  status: z.number().int(),
  message: z.string(),
  data: z.unknown(),
});

export type BaseResponse<T> = {
  status: number;
  message: string;
  data: T;
};

// ===========================================
// Nhóm Schema về Thương Hiệu (Brand Schemas)
// ===========================================

export const BrandResponseSchema = z.object({
  brandId: z.union([z.string(), z.number()]).transform(Number),
  name: z.string(),
});

export type BrandResponse = z.infer<typeof BrandResponseSchema>;

export const BrandListResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.array(BrandResponseSchema),
});

export const BrandPaginatedResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  page_number: z.number(),
  page_size: z.number(),
  count_items: z.number(),
  count_pages: z.number(),
  data: z.array(BrandResponseSchema),
});

// ===========================================
// Nhóm Schema về Danh Mục (Category Schemas)
// ===========================================

export const CategoryResponseSchema = z.object({
  categoryId: z.union([z.string(), z.number()]).transform(Number),
  name: z.string(),
});

export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;

export const CategoryListResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.array(CategoryResponseSchema),
});

export const CategoryPaginatedResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  page_number: z.number(),
  page_size: z.number(),
  count_items: z.number(),
  count_pages: z.number(),
  data: z.array(CategoryResponseSchema),
});

// ===========================================
// Nhóm Schema về Loại Sản phẩm (Product Variant)
// ===========================================

export const ProductVariantSchema = z.object({
  variantId: z.string().optional(),
  color: z.string().optional(),
  storage: z.string().optional(),
  stock: z.number().int().min(0),
  price: z.union([z.string(), z.number()]).transform(v => Number(v)),
  images: z.array(z.string()),
});

export type ProductVariant = z.infer<typeof ProductVariantSchema>;

// ===========================================
// Nhóm Schema về Sản Phẩm (Product Schemas)
// ===========================================

export const ProductResponseSchema = z.object({
  productId: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  description: z.string().optional(),
  totalStock: z.number().int().optional(),
  averageRating: z.union([z.number(), z.null()]).optional(),
  displayPrice: z.union([z.string(), z.number()]).transform(v => Number(v)).optional(),
  status: z.string(),
  variants: z.array(ProductVariantSchema).optional(),
  specsText: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;

export const ProductListResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.array(ProductResponseSchema),
});

export const ProductPaginatedResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  page_number: z.number(),
  page_size: z.number(),
  count_items: z.number(),
  count_pages: z.number(),
  data: z.array(ProductResponseSchema),
});

// ===========================================
// Nhóm Schema cho Chức năng Lọc (Filter/Search)
// ===========================================

export const FilterResponseSchema = z.object({
  productId: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  description: z.string().optional(),
  displayPrice: z.union([z.string(), z.number()]).transform(v => Number(v)),
  totalStock: z.number().int(),
  status: z.string(),
  variants: z.array(ProductVariantSchema),
  specsText: z.string().optional(),
  brand: z.string(),
  category: z.string(),
  averageRating: z.union([z.number(), z.null()]),
  minPrice: z.union([z.number(), z.null()]),
  maxPrice: z.union([z.number(), z.null()]),
  minRating: z.union([z.number(), z.null()]),
  maxRating: z.union([z.number(), z.null()]),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
});

export type FilterResponse = z.infer<typeof FilterResponseSchema>;

export const FilterPaginatedResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  page_number: z.number(),
  page_size: z.number(),
  count_items: z.number(),
  count_pages: z.number(),
  data: z.array(FilterResponseSchema),
});

// ===========================================
// Nhóm Schema cho Hệ thống Xác thực (Authentication)
// ===========================================

export const RegisterResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    userId: z.union([z.string(), z.number()]),
    username: z.string(),
    phoneNumber: z.string().nullable().optional(),
    email: z.string(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    role: z.string(),
    status: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    displayName: z.string().nullable().optional(),
    loginType: z.string(),
  }),
});

export const LoginResponseSchema = z.object({
  status: z.number().optional(), // Match non-standard backend
  message: z.string(),
  data: z.object({
    accessToken: z.string().optional(),
    token: z.string().optional(), // Matches Google Login response in Postman
    refreshToken: z.string(),
    userId: z.union([z.string(), z.number()]),
  }).transform(val => ({
    accessToken: val.accessToken || val.token || '',
    refreshToken: val.refreshToken,
    userId: val.userId,
  })),
});


export type LoginResponse = z.infer<typeof LoginResponseSchema>['data'];

export const LogoutResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.unknown(),
});

export const ForgetPasswordResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    email: z.string(),
    resetToken: z.string(),
  }),
});

export const ResetPasswordResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.unknown(),
});

export const RefreshTokenResponseSchema = LoginResponseSchema;

// ===========================================
// Nhóm Schema Hồ Sơ Người dùng (User Profile)
// ===========================================

export const UserProfileSchema = z.object({
  userId: z.union([z.string(), z.number()]),
  username: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  email: z.string(),
  phoneNumber: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  displayName: z.string().nullable().optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UserProfileResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: UserProfileSchema,
});

export const ChangeAvatarResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    avatarUrl: z.string(),
  }),
});

// ===========================================
// Nhóm Schema cho Mục con trong Giỏ Hàng (Cart Item)
// ===========================================

export const CartItemSchema = z.object({
  cartItemId: z.string(),
  productId: z.string(),
  variantId: z.string(),
  addAt: z.string(),
  updateAt: z.string(),
  currentQuantity: z.number().int().min(1),
  name: z.string(),
  color: z.string(),
  price: z.number().positive(),
  priceAfterDiscount: z.number().positive(),
  inStock: z.number().int().min(0),
  mainImage: z.string(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

// ===========================================
// Nhóm Schema Giỏ Hàng Tổng (Cart Data)
// ===========================================

export const CartDataSchema = z.object({
  cartId: z.string(),
  customerId: z.string(),
  updatedAt: z.string(),
  cartItems: z.array(CartItemSchema),
  totalItems: z.number().int(),
  pageSize: z.number().int(),
  currentPage: z.number().int(),
});

export type CartData = z.infer<typeof CartDataSchema>;

export const CartResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    map: CartDataSchema,
    empty: z.boolean(),
  }),
});

// ===========================================
// Nhóm thao tác với Giỏ hàng (Cart Item Operations)
// ===========================================

export const AddToCartResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    cartItemId: z.string().optional(),
    productId: z.string(),
    variantId: z.string(),
    quantityInCart: z.number().int().min(1),
    quantityInStock: z.number().int().min(0),
  }),
});

export type AddToCartResponse = z.infer<typeof AddToCartResponseSchema>['data'];

export const CartItemActionResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    cartItemId: z.string(),
    quantityInCart: z.number().int().min(1),
    quantityInStock: z.number().int().min(0),
  }),
});

export type CartItemActionResponse = z.infer<typeof CartItemActionResponseSchema>['data'];

export const DeleteCartItemResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.null(),
});

export const CartItemDetailResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: CartItemSchema,
});

export const CartItemListResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    map: CartDataSchema,
    empty: z.boolean(),
  }),
});

export const CartTotalPriceResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.number().nonnegative(),
});

// ===========================================
// Nhóm Schema báo Lỗi chung (Error Response Schemas)
// ===========================================

export const ErrorResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  errors: z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional(),
  details: z.unknown().optional(),
});
