# API Routes & Endpoints Reference

**Mục đích:** Danh sách đầy đủ API routes, endpoints, và cách dùng.

---

## 📍 API Proxy Routes Structure

### Quy Tắc: Frontend gọi via `/api/`, không gọi backend trực tiếp

```
Frontend Request:
POST http://localhost:3000/api/auth/login

↓ Proxy route: app/api/auth/login/route.ts

↓ next.config rewrites to:
POST http://localhost:8081/auth/login

↓ Backend response:

↓ Return to Frontend
```

---

## 🔐 Auth Service (Port 8081)

### Login
```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "username": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "1",
      "email": "user@example.com",
      "role": "USER"
    }
  }
}

Error (400):
{
  "status": 400,
  "message": "Invalid credentials",
  "errors": { "password": "Incorrect password" }
}
```

### Register
```
POST /api/auth/register
Content-Type: application/json

Request:
{
  "email": "newuser@example.com",     // optional
  "username": "newuser",
  "password": "securePass123",
  "passwordConfirm": "securePass123"
}

Response (201):
{
  "status": 201,
  "message": "Registration successful",
  "data": {
    "userId": "123",
    "username": "newuser",
    "email": "newuser@example.com"
  }
}
```

### Refresh Token
```
POST /api/auth/refresh-token
Content-Type: application/json
Cookie: refresh_token=...

Request:
{
  "refreshToken": "eyJhbGc..."
}

Response (200):
{
  "status": 200,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGc..." // New token
    // NOTE: refreshToken usually NOT rotated
  }
}
```

### Logout
```
POST /api/auth/logout
Authorization: Bearer <access_token>

Response (200):
{
  "status": 200,
  "message": "Logout successful"
}
```

### Get Me (Current User)
```
GET /api/users/profile/me
Authorization: Bearer <access_token>

Response (200):
{
  "status": 200,
  "message": "Success",
  "data": {
    "userId": "1",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "avatar": "https://...",
    "addresses": [...]
  }
}

Error (401):
{
  "status": 401,
  "message": "Token expired or invalid"
}
```

---

## 🛍️ Product Service (Port 8082)

### Get Products (Paginated)
```
GET /api/products/paged?page=0&size=10&sortBy=create_at&sortDirection=ASC
Authorization: Bearer <access_token>

Response (200):
{
  "status": 200,
  "message": "Success",
  "data": {
    "items": [
      {
        "productId": "p1",
        "name": "Nike Shoes",
        "displayPrice": "1000000",
        "averageRating": 4.5,
        "totalStock": 50,
        "category": "Shoes",
        "brandName": "Nike"
      }
    ],
    "page_number": 0,
    "page_size": 10,
    "count_items": 150,
    "count_pages": 15
  }
}
```

### Search & Filter Products
```
POST /api/products/search-filter
Content-Type: application/json

Request:
{
  "keyword": "nike",
  "minPrice": 100000,
  "maxPrice": 5000000,
  "brands": ["Nike", "Adidas"],
  "categories": ["Shoes"],
  "page": 0,
  "size": 20,
  "sortBy": "price",
  "sortDirection": "ASC"
}

Response (200):
{
  "status": 200,
  "data": {
    "items": [...],
    "page_number": 0,
    "page_size": 20,
    "count_items": 45,
    "count_pages": 3
  }
}
```

### Get Product Detail
```
GET /api/products/:id
Authorization: Bearer <access_token>

Example:
GET /api/products/p123

Response (200):
{
  "status": 200,
  "message": "Success",
  "data": {
    "productId": "p123",
    "name": "Nike Air Max",
    "displayPrice": "2500000",
    "description": "Premium running shoes",
    "specsText": "Specs here...",
    "totalStock": 100,
    "averageRating": 4.7,
    "category": "Shoes",
    "brandName": "Nike",
    "variants": [
      {
        "variantId": "v1",
        "name": "Size 40",
        "price": 2500000,
        "stock": 50,
        "images": ["url1", "url2"]
      }
    ]
  }
}
```

### Get All Brands
```
GET /api/brands
Authorization: Bearer <access_token>

Response (200):
{
  "status": 200,
  "data": {
    "items": [
      {
        "brandId": "b1",
        "name": "Nike",
        "logoUrl": "https://..."
      }
    ]
  }
}
```

### Get All Categories
```
GET /api/categories
Authorization: Bearer <access_token>

Response (200):
{
  "status": 200,
  "data": {
    "items": [
      {
        "categoryId": "c1",
        "name": "Shoes",
        "description": "All types of shoes"
      }
    ]
  }
}
```

---

## 🛒 Cart Service (Port 8083)

### Get Cart
```
GET /api/carts
Authorization: Bearer <access_token>

Response (200):
{
  "status": 200,
  "message": "Success",
  "data": {
    "cartId": "cart1",
    "userId": "user1",
    "items": [
      {
        "cartItemId": "ci1",
        "productId": "p1",
        "productName": "Nike Shoes",
        "variantId": "v1",
        "quantity": 2,
        "price": 2000000
      }
    ],
    "totalItems": 2,
    "totalPrice": 4000000
  }
}
```

### Add to Cart
```
POST /api/carts/add
Authorization: Bearer <access_token>
Content-Type: application/json

Request:
{
  "productId": "p1",
  "variantId": "v1",
  "quantity": 2
}

Response (201):
{
  "status": 201,
  "message": "Item added to cart",
  "data": {
    "cartItemId": "ci1",
    "productId": "p1",
    "quantity": 2,
    "price": 2000000
  }
}
```

### Increase Cart Item Quantity
```
PATCH /api/cart-items/increase/:cartItemId
Authorization: Bearer <access_token>

Response (200):
{
  "status": 200,
  "message": "Quantity increased",
  "data": {
    "cartItemId": "ci1",
    "quantity": 3
  }
}
```

### Decrease Cart Item Quantity
```
PATCH /api/cart-items/decrease/:cartItemId
Authorization: Bearer <access_token>

Response (200):
{
  "status": 200,
  "message": "Quantity decreased",
  "data": {
    "cartItemId": "ci1",
    "quantity": 1
  }
}
```

### Delete Cart Item
```
DELETE /api/cart-items/delete/:cartItemId
Authorization: Bearer <access_token>

Response (200):
{
  "status": 200,
  "message": "Item removed from cart"
}
```

### Calculate Cart Price
```
POST /api/carts/price
Authorization: Bearer <access_token>
Content-Type: application/json

Request:
{
  "cartItemIds": ["ci1", "ci2"],
  "userDiscountId": "disc1",  // optional
  "includeDiscount": true
}

Response (200):
{
  "status": 200,
  "message": "Success",
  "data": {
    "subtotal": 10000000,
    "discount": 500000,
    "shipping": 50000,
    "tax": 1000000,
    "total": 10550000
  }
}
```

### Get Cart with Pagination
```
GET /api/carts/with-items-paging?page=0&size=10&sortBy=created&sortDir=DESC
Authorization: Bearer <access_token>

Response (200):
{
  "status": 200,
  "data": {
    "items": [...],
    "page_number": 0,
    "page_size": 10,
    "count_items": 25,
    "count_pages": 3
  }
}
```

---

## 👤 User Service (Port 8081)

### Update Profile
```
PUT /api/users/profile/me
Authorization: Bearer <access_token>
Content-Type: application/json

Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "displayName": "John D"
}

Response (200):
{
  "status": 200,
  "message": "Profile updated",
  "data": {
    "userId": "1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "displayName": "John D"
  }
}
```

### Change Avatar
```
POST /api/users/change-avatar/me
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Request:
<multipart file upload>

Response (200):
{
  "status": 200,
  "message": "Avatar changed",
  "data": {
    "avatarUrl": "https://..."
  }
}
```

### Change Password
```
POST /api/users/change-password/me
Authorization: Bearer <access_token>
Content-Type: application/json

Request:
{
  "oldPassword": "oldPass123",
  "newPassword": "newPass456"
}

Response (200):
{
  "status": 200,
  "message": "Password changed"
}
```

---

## 🔗 Frontend Implementation Examples

### Using Repositories

```typescript
// infrastructure/repositories/product/product.repository.ts

export class ProductRepository {
  // ✅ GET
  static async getById(id: string): Promise<Product> {
    const response = await fetchWithToken(`/products/${id}`);
    return ProductSchema.parse(response.data);
  }
  
  // ✅ POST
  static async searchAndFilter(params: SearchParams) {
    const response = await fetchWithToken('/products/search-filter', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    return PaginatedProductSchema.parse(response.data);
  }
  
  // ✅ PATCH
  static async updateCart(id: string) {
    const response = await fetchWithToken(`/cart-items/increase/${id}`, {
      method: 'PATCH'
    });
    return CartItemSchema.parse(response.data);
  }
  
  // ✅ DELETE
  static async removeFromCart(id: string) {
    await fetchWithToken(`/cart-items/delete/${id}`, {
      method: 'DELETE'
    });
  }
}
```

### Using Hooks

```typescript
// presentation/hooks/use-product.ts

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => ProductRepository.getById(id)
  });
}

export function useAddToCartMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload) => CartRepository.addToCart(payload),
    onSuccess: () => {
      // Invalidate cart queries to refetch
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
}
```

---

## ⚠️ Common Mistakes

### ❌ Calling Backend Directly

```typescript
// WRONG: Direct call to backend (CORS, insecure)
const response = await fetch('http://localhost:8081/auth/login', {
  method: 'POST'
});

// RIGHT: Call via API proxy
const response = await fetch('/api/auth/login', {
  method: 'POST'
});
```

### ❌ Forgetting Authorization Header

```typescript
// WRONG: Missing token
const response = await fetch('/api/products', {
  method: 'GET'
});

// RIGHT: fetchWithToken adds it automatically
const response = await fetchWithToken('/products');
```

### ❌ Not Validating Response

```typescript
// WRONG: Use data directly
const data = JSON.parse(response);
return data; // What if data structure changed?

// RIGHT: Validate with Zod
const data = ProductSchema.parse(response);
return data; // Type-safe & validated
```

---

## 📊 Status Codes & Meanings

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Use data |
| 201 | Created | Use data (resource created) |
| 400 | Bad Request | Show validation errors |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show "Access Denied" |
| 404 | Not Found | Show "Not Found" page |
| 500 | Server Error | Retry or show error |

---

**Last Updated:** March 5, 2026

