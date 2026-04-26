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
---

## 5. Đồng bộ Dữ liệu & Tồn kho (Event-Driven)

Product Service duy trì tính chính xác của dữ liệu thông qua việc lắng nghe các sự kiện từ hệ thống.

### Cập nhật Đánh giá (Rating Sync)
- **Topíc Kafka**: `order.create.feedback`
- **Mô tả**: Khi người dùng gửi feedback thành công ở Order Service, Product Service sẽ nhận sự kiện này để tính toán lại `averageRating` và `ratedQuantity` cho sản phẩm tương ứng.

### Nhật ký Tồn kho (Inventory Logging)
- **Topic Kafka**: `product.commands`
- **Mô tả**: Mọi thay đổi về số lượng tồn kho (do Checkout, Cancel Order, hoặc Admin nhập hàng) đều được lưu lại trong `InventoryLog`.
- **Dữ liệu Log**: Bao gồm `variantId`, `oldStock`, `newStock`, `reason` và `timestamp`.

### Quản lý Giảm giá (Discount Usage)
- Hệ thống theo dõi việc sử dụng voucher thông qua `DiscountUsage`. 
- Khi một đơn hàng hoàn tất, số lượng `remainingUsage` của Discount sẽ được cập nhật tự động.

---

## Product Management (Commands - Admin Only)

### Create a New Product
#### 1. Overview
- Purpose: Create a new product with its variants.
- Service: product-service

#### 2. Endpoint
- `POST /api/products/admin`

#### 3. Request
- Headers: `Authorization: Bearer <token>`
- Body: `CreateProductRequest`
```json
{
  "name": "iPhone 15 Pro",
  "description": "Latest Apple smartphone",
  "displayPrice": 999.00,
  "brandId": 1,
  "categoryId": 1,
  "status": "ACTIVE",
  "variants": [
    {
      "variantCode": "IP15P-128-BLK",
      "price": 999.00,
      "stock": 50,
      "storage": "128GB",
      "color": "Black",
      "images": ["url1", "url2"]
    }
  ]
}
```

#### 4. Response
- Success: `BaseResponse<ProductResponse>`
```json
{
  "status": 200,
  "message": "Create a new product successfully!",
  "data": {
    "productId": "uuid...",
    "name": "iPhone 15 Pro",
    "description": "Latest Apple smartphone",
    "totalStock": 50,
    "averageRating": 0.0,
    "ratedQuantity": 0,
    "displayPrice": 999.00,
    "status": "ACTIVE",
    "variants": [...],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```
- Error: 500 (Internal Server Error) with error message.

#### 5. Business Logic Notes
- Validates brand and category existence.
- Automatically handles variant creation and inventory initialization.

#### 6. Dependencies / Data Flow
- Persists data to the Product DB.
- Sends message to VertX EventBus (`create.new.product`).

---

### Add a Variant to a Product
#### 1. Overview
- Purpose: Add a new variant to an existing product.
- Service: product-service

#### 2. Endpoint
- `POST /api/products/admin/{productId}/variant`

#### 3. Request
- Headers: `Authorization: Bearer <token>`
- Path Params: `productId` (UUID)
- Body: `CreateProductVariantRequest`
```json
{
  "variantCode": "IP15P-256-BLK",
  "price": 1099.00,
  "stock": 30,
  "storage": "256GB",
  "color": "Black",
  "images": []
}
```

#### 4. Response
- Success: `BaseResponse<ProductResponse>`

#### 5. Business Logic Notes
- `productId` must exist.
- `variantCode` should be unique.

#### 6. Dependencies / Data Flow
- Updates Product and creates ProductVariant in DB.

---

### Add Image to Product Variant
#### 1. Overview
- Purpose: Upload and add an image to a specific variant.
- Service: product-service

#### 2. Endpoint
- `POST /api/products/admin/{productId}/variant/{variantId}/image`

#### 3. Request
- Headers: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- Path Params: `productId` (UUID), `variantId` (String)
- Body: `image` (MultipartFile)

#### 4. Response
- Success: `BaseResponse<ProductVariantResponse>`

#### 5. Business Logic Notes
- Image is uploaded to Cloudinary before being saved to DB.

#### 6. Dependencies / Data Flow
- Cloudinary Storage Service.

---

### Update Product Details
#### 1. Overview
- Purpose: Update general product information.
- Service: product-service

#### 2. Endpoint
- `PUT /api/products/admin/{productId}`

#### 3. Request
- Path Params: `productId` (UUID)
- Body: `UpdateProductRequest`
```json
{
  "name": "Updated Name",
  "description": "Updated Description",
  "displayPrice": 950.00,
  "brandId": 1,
  "categoryId": 1,
  "status": "ACTIVE"
}
```

#### 4. Response
- Success: `BaseResponse<ProductResponse>`

---

### Update Variant Details
#### 1. Overview
- Purpose: Update specific product variant details.
- Service: product-service

#### 2. Endpoint
- `PUT /api/products/admin/{productId}/variant/{variantId}`

#### 3. Request
- Path Params: `productId` (UUID), `variantId` (String)
- Body: `UpdateProductVariantRequest`
```json
{
  "price": 950.00,
  "stock": 100,
  "storage": "128GB",
  "color": "White",
  "images": ["url1"]
}
```

#### 4. Response
- Success: `BaseResponse<ProductVariantResponse>`

---

### Delete Product
#### 1. Overview
- Purpose: Delete a product and all its variants.
- Service: product-service

#### 2. Endpoint
- `DELETE /api/products/admin/{productId}`

#### 3. Request
- Path Params: `productId` (UUID)

#### 4. Response
- Success: `BaseResponse<Void>`

---

### Delete Product Variant
#### 1. Overview
- Purpose: Delete a specific variant of a product.
- Service: product-service

#### 2. Endpoint
- `DELETE /api/products/admin/{productId}/variant/{variantId}`

#### 3. Request
- Path Params: `productId` (UUID), `variantId` (String)

#### 4. Response
- Success: `BaseResponse<Void>`

---

## Category Management (Commands - Admin Only)

### Create a New Category
#### 1. Overview
- Purpose: Create a new product category.
- Service: product-service

#### 2. Endpoint
- `POST /api/categories/admin`

#### 3. Request
- Headers: `Authorization: Bearer <token>`
- Body: `CreateCategoryRequest`
```json
{
  "name": "Laptops"
}
```

#### 4. Response
- Success: `BaseResponse<CategoryResponse>`

---

### Update Category
#### 1. Overview
- Purpose: Update an existing category name.
- Service: product-service

#### 2. Endpoint
- `PATCH /api/categories/admin/{categoryId}`

#### 3. Request
- Path Params: `categoryId` (Long)
- Body: `CreateCategoryRequest`
```json
{
  "name": "Gaming Laptops"
}
```

#### 4. Response
- Success: `BaseResponse<CategoryResponse>`

---

### Delete Category
#### 1. Overview
- Purpose: Delete a category.
- Service: product-service

#### 2. Endpoint
- `DELETE /api/categories/admin/{categoryId}`

#### 3. Request
- Path Params: `categoryId` (Long)

#### 4. Response
- Success: `BaseResponse<Void>`

---

## Brand Management (Commands - Admin Only)

### Create a New Brand
#### 1. Overview
- Purpose: Create a new product brand.
- Service: product-service

#### 2. Endpoint
- `POST /api/brands/admin`

#### 3. Request
- Headers: `Authorization: Bearer <token>`
- Body: `CreateBrandRequest`
```json
{
  "name": "Apple"
}
```

#### 4. Response
- Success: `BaseResponse<BrandResponse>`

---

### Update Brand
#### 1. Overview
- Purpose: Update an existing brand name.
- Service: product-service

#### 2. Endpoint
- `PATCH /api/brands/admin/{brandId}`

#### 3. Request
- Path Params: `brandId` (Long)
- Body: `CreateBrandRequest`
```json
{
  "name": "Samsung"
}
```

#### 4. Response
- Success: `BaseResponse<BrandResponse>`

---

### Delete Brand
#### 1. Overview
- Purpose: Delete a brand.
- Service: product-service

#### 2. Endpoint
- `DELETE /api/brands/admin/{brandId}`

#### 3. Request
- Path Params: `brandId` (Long)

#### 4. Response
- Success: `BaseResponse<Void>`

---

## Discount Management (Commands - Admin Only)

### Create a New Discount
#### 1. Overview
- Purpose: Create a new discount/voucher.
- Service: product-service

#### 2. Endpoint
- `POST /api/discounts/admin`

#### 3. Request
- Headers: `Authorization: Bearer <token>`
- Body: `CreateDiscountRequest`
```json
{
  "name": "Summer Sale",
  "code": "SUMMER50",
  "type": "FIXED_AMOUNT",
  "scope": "PRODUCT",
  "discountValue": 50.0,
  "availableAt": "2024-06-01T00:00:00",
  "expiredAt": "2024-08-31T23:59:59",
  "remainingUsage": 100,
  "maxUsagePerUser": 1,
  "minOrderValue": 500.0
}
```

#### 4. Response
- Success: `BaseResponse<DiscountResponse>`

---

### Update Discount
#### 1. Overview
- Purpose: Update existing discount details.
- Service: product-service

#### 2. Endpoint
- `PUT /api/discounts/admin/{discountId}`

#### 3. Request
- Path Params: `discountId` (UUID)
- Body: `CreateDiscountRequest`

#### 4. Response
- Success: `BaseResponse<DiscountResponse>`

---

### Apply Products to Discount
#### 1. Overview
- Purpose: Link specific products to a discount.
- Service: product-service

#### 2. Endpoint
- `PUT /api/discounts/admin/{discountId}/apply-products`

#### 3. Request
- Path Params: `discountId` (UUID)
- Body: `UpdateProductDiscountRequest`
```json
{
  "productIds": ["uuid1", "uuid2"]
}
```

#### 4. Response
- Success: `BaseResponse<CreateProductDiscountResponse>`

---

### Delete Discount
#### 1. Overview
- Purpose: Delete a discount.
- Service: product-service

#### 2. Endpoint
- `DELETE /api/discounts/admin/{discountId}`

#### 3. Request
- Path Params: `discountId` (UUID)

#### 4. Response
- Success: `BaseResponse<Void>`
