# TÀI LIỆU API CHI TIẾT - HỆ THỐNG E-COMMERCE AI AGENT

Tài liệu này cung cấp đặc tả kỹ thuật thuần túy cho các API endpoints trong hệ thống Java backend, đảm bảo chính xác 100% dựa trên source code.

**Gateway Base URL**: `http://localhost:8080`

---

## 🛡️ CHUẨN PHẢN HỒI CHUNG

### 1. BaseResponse (Standard)

Hầu hết các API trả về JSON có cấu trúc bọc (Wrapped):

```json
{
  "status": 200,    // Mã lỗi/thành công (int)
  "message": "...", // Thông báo (string)
  "data": { ... }   // Dữ liệu payload (Object/Array/null)
}
```

### 2. Direct Array Response (Exception)

**LƯU Ý QUAN TRỌNG**: Các API lấy danh sách toàn bộ (không phân trang) sau đây trả về một mảng JSON trực tiếp, **KHÔNG** bọc trong `BaseResponse`:

- `GET /api/brands`
- `GET /api/categories`

### 3. PaginationBaseResponse (Paged)

Các API có phân trang trả về cấu trúc:

```json
{
  "status": 200,
  "message": "...",
  "page_number": 0,  // Trang hiện tại (int)
  "page_size": 10,   // Số lượng mỗi trang (int)
  "count_items": 100,// Tổng số item (int)
  "count_pages": 10, // Tổng số trang (int)
  "data": [ ... ]    // Mảng dữ liệu (Array)
}
```

---

## 👤 1. USER SERVICE (`:8081`)

### 1.1 Xác thực (`/api/auth`)

#### **[POST] Đăng ký tài khoản (Local)**

- **Endpoint**: `/api/auth/register/local`
- **Bảo mật**: Public
- **Request Body**:
  ```json
  {
    "username": "customer_01",
    "password": "Password123!",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "0912345678"
  }
  ```
- **Response**: `BaseResponse<UserDTO>`

#### **[POST] Đăng nhập nội bộ**

- **Endpoint**: `/api/auth/login/local`
- **Bảo mật**: Public
- **Request Body**:
  ```json
  {
    "username": "customer_01",
    "password": "Password123!"
  }
  ```
- **Response**:
  ```json
  {
    "status": 200,
    "data": {
      "userId": "uuid",
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
  ```

#### **[POST] Đăng nhập Google**

- **Endpoint**: `/api/auth/login/google`
- **Bảo mật**: Public
- **Request Body**: `{ "idToken": "google_id_token" }`
- **Response**: Trả về `userId`, `accessToken`, `refreshToken` (như login local).

#### **[POST] Làm mới Token**

- **Endpoint**: `/api/auth/refresh-token`
- **Request Body**: `{ "refreshToken": "string" }`
- **Response**: Trả về cặp `accessToken`, `refreshToken` mới.

#### **[POST] Đăng xuất**

- **Endpoint**: `/api/auth/logout`
- **Bảo mật**: Bearer Token
- **Request Body**: `{ "refreshToken": "string" }`
- **Response**: `{"status": 200, "message": "Logout successful!"}`

#### **[POST] Quên mật khẩu**

- **Endpoint**: `/api/auth/forget-password`
- **Request Body**: `{ "email": "string" }`
- **Response**: `{"status": 200, "message": "Password reset link sent..."}`

#### **[POST] Đặt lại mật khẩu**

- **Endpoint**: `/api/auth/reset-password`
- **Request Body**: `{ "resetToken": "string", "newPassword": "string" }`

---

### 1.2 Quản lý người dùng (`/api/users`)

#### **[GET] Thông tin cá nhân (Me)**

- **Endpoint**: `/api/users/profile/me`
- **Bảo mật**: Bearer Token
- **Request Body**: Không có
- **Response Example**:
  ```json
  {
    "status": 200,
    "data": {
      "userId": "uuid",
      "username": "customer_01",
      "displayName": "John Doe",
      "imageUrl": "cloudinary_url",
      "email": "user@ex.com"
    }
  }
  ```

#### **[PUT] Cập nhật thông tin**

- **Endpoint**: `/api/users/profile/me`
- **Bảo mật**: Bearer Token
- **Request Body**: `{ "firstName": "string", "lastName": "string", "phoneNumber": "string" }`

#### **[PUT] Đổi mật khẩu**

- **Endpoint**: `/api/users/change-password/me`
- **Bảo mật**: Bearer Token
- **Request Body**: `{ "oldPassword": "...", "newPassword": "...", "confirmPassword": "..." }`

#### **[PUT] Đổi ảnh đại diện**

- **Endpoint**: `/api/users/change-avatar/me`
- **Bảo mật**: Bearer Token
- **Headers**: `Content-Type: multipart/form-data`
- **Form Data**: `avatar` (Binary File)
- **Request Body**: Không có

---

### 1.3 Quản lý địa chỉ (`/api/addresses`)

#### **[POST] Thêm địa chỉ mới**

- **Endpoint**: `/api/addresses`
- **Bảo mật**: Bearer Token
- **Request Body**:
  ```json
  {
    "province": "string",
    "city": "string",
    "ward": "string",
    "street": "string",
    "no": "string",
    "isDefault": true,
    "receiverName": "string",
    "receiverPhoneNumber": "string"
  }
  ```
- **Response**: `BaseResponse<AddressResponse>`

#### **[GET] Danh sách địa chỉ (Tất cả)**

- **Endpoint**: `/api/addresses`
- **Bảo mật**: Bearer Token
- **Response**: `BaseResponse<List<AddressResponse>>`

#### **[GET] Chi tiết địa chỉ**

- **Endpoint**: `/api/addresses/{addressId}`
- **Response**: `BaseResponse<AddressResponse>`

#### **[GET] Danh sách địa chỉ (Phân trang)**

- **Endpoint**: `/api/addresses/paged`
- **Query Params**: `page`, `size`, `sortBy`, `sortDirection`

---

### 1.4 Tài khoản thanh toán (`/api/payment-accounts`)

#### **[POST] Thêm tài khoản**

- **Endpoint**: `/api/payment-accounts`
- **Bảo mật**: Bearer Token
- **Request Body**: `{ "accountNumber": "string", "bankName": "string", "ownerName": "string", "type": "string" }`
- **Response**: `BaseResponse<PaymentAccountResponse>`

#### **[GET] Danh sách (Tất cả)**

- **Endpoint**: `/api/payment-accounts`
- **Bảo mật**: Bearer Token

#### **[GET] Danh sách (Phân trang)**

- **Endpoint**: `/api/payment-accounts/paged`
- **Query Params**: `page`, `size`, `sortBy`, `sortDirection`

---

## 📱 2. PRODUCT SERVICE (`:8082`)

### 2.1 Sản phẩm (`/api/products`)

#### **[GET] Danh sách (Phân trang)**

- **Endpoint**: `/api/products/paged`
- **Query Params**: `page`, `size`, `sortBy`, `sortDirection`
- **Response**: `PaginationBaseResponse<List<ProductResponse>>`

#### **[GET] Tìm kiếm & Lọc (Search-Filter)**

- **Endpoint**: `/api/products/search-filter`
- **Query Params**:
  - `minPrice`, `maxPrice`: Double
  - `minRating`, `maxRating`: Double
  - `keyword`: String
  - `categoryId`, `brandId`: Long
  - `page`, `size`, `sortBy`, `sortDirection`
- **Response**: `PaginationBaseResponse<List<FilterResponse>>`

#### **[GET] Chi tiết sản phẩm**

- **Endpoint**: `/api/products/{id}`
- **Path Param**: `id` (UUID format)
- **Response**: `BaseResponse<ProductResponse>`

---

### 2.2 Thương hiệu & Danh mục

#### **[GET] Danh sách Thương hiệu (Tất cả)**

- **Endpoint**: `/api/brands`
- **Response**: `List<BrandResponse>` (Trả về **Array trực tiếp**, không bọc BaseResponse)

#### **[GET] Chi tiết Thương hiệu**

- **Endpoint**: `/api/brands/{brandId}`
- **Response**: `BaseResponse<BrandDTO>` (Có bọc BaseResponse)

#### **[GET] Danh sách Thương hiệu (Phân trang)**

- **Endpoint**: `/api/brands/paged`
- **Response**: `PaginationBaseResponse<List<BrandResponse>>`

#### **[GET] Danh sách Danh mục (Tất cả)**

- **Endpoint**: `/api/categories`
- **Response**: `List<CategoryResponse>` (Trả về **Array trực tiếp**, không bọc BaseResponse)

#### **[GET] Danh sách Danh mục (Phân trang)**

- **Endpoint**: `/api/categories/paged`
- **Response**: `PaginationBaseResponse<List<CategoryResponse>>`

---

## 🛒 3. CART SERVICE (`:8083`)

### 3.1 Thao tác giỏ hàng

#### **[POST] Thêm sản phẩm vào giỏ**

- **Endpoint**: `/api/carts/add-to-cart`
- **Bảo mật**: Bearer Token
- **Request Body**: `{ "productId": "uuid", "variantId": "string" }`
- **Response**: `BaseResponse<AddProductToCartResponse>`

#### **[GET] Lấy giỏ hàng (Toàn bộ)**

- **Endpoint**: `/api/carts`
- **Bảo mật**: Bearer Token
- **Response**: `BaseResponse<CartDTO>` (Chứa list items)

#### **[GET] Lấy giỏ hàng (Phân trang items)**

- **Endpoint**: `/api/carts/with-items-paging`
- **Query Params**: `page`, `size`, `sortBy`, `sortDir`
- **Response**: `BaseResponse<PagedCartDTO>`

#### **[POST] Tính giá tiền**

- **Endpoint**: `/api/carts/price`
- **Bảo mật**: Bearer Token
- **Request Body**:
  ```json
  {
    "cartItemIds": ["uuid-1", "uuid-2"],
    "includeDiscount": true,
    "userDiscountId": "uuid-optional"
  }
  ```
- **Response**: `BaseResponse<BigDecimal>` (data: con số tổng tiền)

---

### 3.2 Quản lý Item trong giỏ (`/api/cart-items`)

#### **[PATCH] Tăng/Giảm số lượng**

- **Endpoint**: `/api/cart-items/increase/{itemId}`
- **Endpoint**: `/api/cart-items/decrease/{itemId}`
- **Bảo mật**: Bearer Token
- **Response**: `BaseResponse<ChangeItemQuantityResponse>`

#### **[DELETE] Xóa Item**

- **Endpoint**: `/api/cart-items/delete/{itemId}`
- **Bảo mật**: Bearer Token
- **Response**: `{"status": 200, "message": "delete cart item success"}`

---

## 📈 SWAGGER TOOL (Dùng Thử API)

Hệ thống tự động tổng hợp tài liệu tại:

- **Tất cả service**: `http://localhost:8080/swagger-ui.html` (Khuyên dùng)
- **User**: `http://localhost:8081/swagger-ui.html`
- **Product**: `http://localhost:8082/swagger-ui.html`
- **Cart**: `http://localhost:8083/swagger-ui.html`
