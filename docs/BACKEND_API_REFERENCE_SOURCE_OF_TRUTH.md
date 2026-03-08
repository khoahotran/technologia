# Backend API Reference (Source: Code)

Derived from:
- `ecommerce-ai-agent-core/api-gateway/src/main/resources/application.properties`
- `ecommerce-ai-agent-core/java-core/src/main/java/ecom/core/base_dto/*`
- Controllers/security in `user-service`, `product-service`, `cart-service`

Gateway base URL: `http://localhost:8080`

## 1) Gateway Route Map

| Gateway Path Prefix | Target Service | Service Port |
|---|---|---|
| `/api/users/**`, `/api/addresses/**`, `/api/payment-accounts/**`, `/api/auth/**` | user-service | `8081` |
| `/api/products/**`, `/api/brands/**`, `/api/categories/**`, `/api/discounts/**` | product-service | `8082` |
| `/api/carts/**`, `/api/cart-items/**` | cart-service | `8083` |

## 2) Response Wrappers

### `BaseResponse<T>`
```json
{
  "status": 200,
  "message": "Request successful!",
  "data": {}
}
```

Fields:
- `status: number`
- `message: string`
- `data: T | null`

### `PaginationBaseResponse<T>`
```json
{
  "status": 200,
  "page_number": 0,
  "page_size": 10,
  "count_items": 100,
  "count_pages": 10,
  "data": [],
  "message": "Get products successfully"
}
```

Fields:
- `status: number`
- `page_number: number`
- `page_size: number`
- `count_items: number`
- `count_pages: number`
- `data: T`
- `message: string`

## 3) Auth Flow (Code-Accurate)

Important:
- Backend login endpoint is **`POST /api/auth/login/local`**, not `/api/auth/login`.
- Google login: `POST /api/auth/login/google`.
- Refresh: `POST /api/auth/refresh-token`.
- Logout: `POST /api/auth/logout`.

### Login (`POST /api/auth/login/local`)
Request body:
```json
{ "username": "string", "password": "string" }
```

Success `BaseResponse` data:
```json
{
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "userId": "uuid"
}
```

### Protected calls
Header required:
- `Authorization: Bearer <accessToken>`

### Token expiration and refresh behavior
- Access token expiry: from `jwt.expiration-ms` (`JWT_EXPIRATION_MS` env).
- Refresh token JWT expiry: from `jwt.refresh-expiration-ms` (`JWT_REFRESH_EXPIRATION_MS` env).
- Refresh token persistence in DB uses `LocalDate.now().plusDays(7)` in `LoginService`.
- Refresh endpoint validates refresh token exists in DB, then issues new access token.
- Logout deletes refresh token from DB.

### Role/permission checks
- JWT includes `role` and `userId` claims.
- Security rules:
  - User service: `/api/auth/**` is public, others authenticated, `/admin/**` requires `ROLE_ADMIN`.
  - Product service: `GET` on `/api/products/**`, `/api/brands/**`, `/api/categories/**`, `/api/discounts/**` is public.
  - Cart service: endpoints authenticated (except swagger/h2/error paths).

## 4) Endpoint Catalog by Gateway Path

Common pagination query params on `.../paged` and filtered product list:
- `page` (default `0`)
- `size` (default `10`)
- `sortBy` (optional)
- `sortDirection` (`ASC`/`DESC`, default `DESC`)

### User service routes

#### Auth (`/api/auth/*`, no Authorization required)
- `POST /api/auth/register/local`
- `POST /api/auth/login/local`
- `POST /api/auth/login/google`
- `POST /api/auth/logout`
- `POST /api/auth/refresh-token`
- `POST /api/auth/forget-password`
- `POST /api/auth/reset-password`

#### User profile (`Authorization` required)
- `GET /api/users/profile/me`
- `PUT /api/users/profile/me`
- `PUT /api/users/change-avatar/me` (multipart `avatar`)
- `PUT /api/users/change-password/me`

#### Addresses (`Authorization` required)
- `GET /api/addresses`
- `GET /api/addresses/{addressId}`
- `GET /api/addresses/paged`
- `POST /api/addresses`
- `PUT /api/addresses/{addressId}`
- `PATCH /api/addresses/set-default/{addressId}`
- `DELETE /api/addresses/{addressId}`

#### Payment accounts (`Authorization` required)
- `GET /api/payment-accounts`
- `GET /api/payment-accounts/{paymentAccountId}`
- `GET /api/payment-accounts/paged`
- `POST /api/payment-accounts`
- `PUT /api/payment-accounts/{paymentAccountId}`
- `PATCH /api/payment-accounts/set-default/{paymentAccountId}`
- `DELETE /api/payment-accounts/{paymentAccountId}`

### Product service routes

Public GET endpoints:
- `GET /api/products/{id}` (`id` UUID format)
- `GET /api/products/paged`
- `GET /api/products/search-filter`
- `GET /api/brands`
- `GET /api/brands/{brandId}`
- `GET /api/brands/paged`
- `GET /api/categories`
- `GET /api/categories/{categoryId}`
- `GET /api/categories/paged`
- `GET /api/discounts`
- `GET /api/discounts/{discountId}`
- `GET /api/discounts/paged`

`/api/products/search-filter` query params:
- `minPrice`, `maxPrice`
- `minRating`, `maxRating`
- `keyword`
- `categoryId`, `brandId`
- plus pagination params

### Cart service routes (`Authorization` required)
- `POST /api/carts/add-to-cart`
- `GET /api/carts`
- `GET /api/carts/item/{id}`
- `GET /api/carts/with-items-paging`
- `POST /api/carts/price`
- `PATCH /api/cart-items/increase/{itemId}`
- `PATCH /api/cart-items/decrease/{itemId}`
- `DELETE /api/cart-items/delete/{itemId}`

