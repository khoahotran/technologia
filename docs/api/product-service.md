# Product Service API Documentation

The Product Service is a read-optimized service that provides information about products, brands, categories, and discounts. It receives data updates via Kafka.

## Product Management (Query Only)

### Get Product by ID
`GET /api/products/{productId}`

**Path Variable:** `productId` (UUID)

**Response:** `BaseResponse<ProductResponse>`
- `ProductResponse`:
    - `productId` (UUID)
    - `name` (String)
    - `description` (String)
    - `totalStock` (Integer)
    - `averageRating` (Double)
    - `ratedQuantity` (long)
    - `displayPrice` (BigDecimal)
    - `status` (ProductStatus): Enum (e.g., ACTIVE, INACTIVE)
    - `variants` (List<ProductVariantResponse>)
    - `createdAt` (String)
    - `updatedAt` (String)

- `ProductVariantResponse`:
    - `variantId` (String)
    - `price` (BigDecimal)
    - `color` (String)
    - `storage` (String)
    - `stock` (Integer)
    - `images` (List<String>)

---

### Get Paged Products
`GET /api/products/paged`

**QueryParams:** `BasePaginationRequest`
- `page` (int)
- `size` (int)
- `sortBy` (String)
- `sortDirection` (String)

**Response:** `PaginationBaseResponse<List<ProductResponse>>`

---

### Search & Filter Products
`GET /api/products/search-filter`

**QueryParams:**
- `page` (int)
- `size` (int)
- `sortBy` (String)
- `sortDirection` (String)
- `minPrice` (Double)
- `maxPrice` (Double)
- `minRating` (Double)
- `maxRating` (Double)
- `keyword` (String)
- `categoryId` (Long)
- `brandId` (Long)

**Response:** `PaginationBaseResponse<List<FilterResponse>>`
- `FilterResponse`:
    - `productId` (UUID)
    - `name` (String)
    - `description` (String)
    - `displayPrice` (BigDecimal)
    - `totalStock` (Integer)
    - `status` (String)
    - `variants` (List<ProductVariantResponse>)
    - `brand` (String): Brand name.
    - `category` (String): Category name.
    - `averageRating` (Double)
    - `ratedQuantity` (long)
    - `minPrice` (Double)
    - `maxPrice` (Double)
    - `minRating` (Double)
    - `maxRating` (Double)
    - `sortBy` (String)
    - `sortOrder` (String)

---

## Brand Management (Query Only)

### Get All Brands
`GET /api/brands`

**Response:** `List<BrandResponse>`
- `BrandResponse`:
    - `brandId` (Long)
    - `name` (String)

---

### Get Brand by ID
`GET /api/brands/{brandId}`

**Response:** `BaseResponse<BrandResponse>`

---

### Get Paged Brands
`GET /api/brands/paged`

**QueryParams:** `BasePaginationRequest`

**Response:** `PaginationBaseResponse<List<BrandResponse>>`

---

## Category Management (Query Only)

### Get All Categories
`GET /api/categories`

**Response:** `List<CategoryResponse>`
- `CategoryResponse`:
    - `categoryId` (Long)
    - `name` (String)

---

### Get Category by ID
`GET /api/categories/{categoryId}`

**Response:** `BaseResponse<CategoryResponse>`

---

### Get Paged Categories
`GET /api/categories/paged`

**QueryParams:** `BasePaginationRequest`

**Response:** `PaginationBaseResponse<List<CategoryResponse>>`

---

## Discount Management (Query Only)

### Calculate Discount
`POST /api/discounts/from-code` (Protected)

Calculates the discount for a given voucher code and list of products.

**Request Body:** `GetDiscountRequest`
- `voucherCode` (String)
- `products` (List<ProductVariantRequest>):
    - `variantId` (String)
    - `quantity` (Integer)

**Response:** `BaseResponse<CalculateDiscountResponse>`
- `CalculateDiscountResponse`:
    - `totalDiscount` (BigDecimal)
    - `productDiscountResponses` (List<ProductDiscountResponse>):
        - `variantId` (String)
        - `discountAmount` (BigDecimal)

---

### Get All Discounts
`GET /api/discounts`

**Response:** `BaseResponse<List<DiscountResponse>>`
- `DiscountResponse`:
    - `discountId` (UUID)
    - `createAt` (String)
    - `availableAt` (String)
    - `expireAt` (String)
    - `code` (String)
    - `type` (String)
    - `scope` (String)
    - `discountValue` (BigDecimal)
    - `description` (String)
    - `name` (String)
    - `remainingUsage` (Integer)
    - `maxUsagePerUser` (Integer)
    - `minOrderValue` (BigDecimal)
    - `isActive` (Boolean)

---

### Get Discount by ID
`GET /api/discounts/{discountId}`

**Response:** `BaseResponse<DiscountResponse>`

---

### Get Paged Discounts
`GET /api/discounts/paged`

**QueryParams:** `BasePaginationRequest`

**Response:** `PaginationBaseResponse<List<DiscountResponse>>`
