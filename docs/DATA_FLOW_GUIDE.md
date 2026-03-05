# Luồng Dữ Liệu Chi Tiết (Data Flow Guide)

**Mục đích:** Hình dung cách dữ liệu chảy từ UI → Backend → Storage và ngược lại.

---

## 🔄 Luồng Dữ Liệu Tổng Quan

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                             │
│              (React Component + Hooks)                         │
└────────────────┬────────────────────────────────────────────┘
                 │ (1) import useAddToCartMutation()
┌────────────────▼────────────────────────────────────────────┐
│                 PRESENTATION LAYER                            │
│      (Custom Hooks with TanStack Query)                       │
│ useAddToCartMutation() → mutation.mutate(payload)             │
└────────────────┬────────────────────────────────────────────┘
                 │ (2) mutationFn: CartRepository.addToCart()
┌────────────────▼────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                          │
│      (Repository + HTTP Client)                              │
│ CartRepository.addToCart() → fetchWithToken('/carts/add')     │
└────────────────┬────────────────────────────────────────────┘
                 │ (3) HTTP POST request
┌────────────────▼────────────────────────────────────────────┐
│                  NEXT.JS PROXY LAYER                         │
│      (API Routes with Authentication)                        │
│ POST /api/carts/add → next.config rewrites to :8083          │
└────────────────┬────────────────────────────────────────────┘
                 │ (4) Forward with token from cookies
┌────────────────▼────────────────────────────────────────────┐
│                  BACKEND SERVICE (Java)                       │
│              (Cart Service on port 8083)                      │
│ POST /carts/add → Process → Return response                   │
└────────────────┬────────────────────────────────────────────┘
                 │ (5) JSON response with data
┌────────────────▼────────────────────────────────────────────┐
│                  RESPONSE HANDLING                            │
│      (Zod validation + Error mapping)                        │
│ Validate with CartItemResponseSchema                          │
└────────────────┬────────────────────────────────────────────┘
                 │ (6) Return to hook
┌────────────────▼────────────────────────────────────────────┐
│                  CACHE INVALIDATION                           │
│         (TanStack Query cache update)                        │
│ queryClient.invalidateQueries(['cart'])                       │
└────────────────┬────────────────────────────────────────────┘
                 │ (7) Re-fetch cart
┌────────────────▼────────────────────────────────────────────┐
│                    RE-RENDER UI                               │
│         (React component updates state)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Ví Dụ 1: Thêm Sản Phẩm Vào Giỏ Hàng

### Bước 1️⃣ - User nhấn nút "Add to Cart"

**File:** `components/features/product/ProductDetail.tsx`

```typescript
function ProductDetail({ productId }) {
  // Lấy mutation hook từ presentation layer
  const { mutate: addToCart } = useAddToCartMutation();
  
  const handleAddClick = () => {
    addToCart({
      productId: productId,
      quantity: 1,
      variantId: variantId
    });
  };
  
  return (
    <button onClick={handleAddClick}>
      Add to Cart
    </button>
  );
}
```

### Bước 2️⃣ - Hook gọi Repository

**File:** `presentation/hooks/use-cart.ts`

```typescript
export function useAddToCartMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    // ← Gọi repository layer
    mutationFn: (payload) => CartRepository.addToCart(payload),
    
    onSuccess: () => {
      // Xóa cache cũ, tự động refetch
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
}
```

### Bước 3️⃣ - Repository gọi HTTP Client

**File:** `infrastructure/repositories/cart/cart.repository.ts`

```typescript
export class CartRepository {
  static async addToCart(payload: AddToCartPayload) {
    // Validate input
    const validated = CartAddSchema.parse(payload);
    
    // Gọi HTTP client (có token tự động)
    const response = await fetchWithToken('/carts/add', {
      method: 'POST',
      body: JSON.stringify(validated)
    });
    
    // Validate response
    const result = CartItemResponseSchema.parse(response.data);
    
    return result;
  }
}
```

### Bước 4️⃣ - HTTP Client thêm Token vào Header

**File:** `infrastructure/http/fetch-with-token.ts`

```typescript
export async function fetchWithToken(path: string, options?: RequestInit) {
  // 1. Lấy token từ storage (cookies)
  let token = authStorage.getAccessToken();
  
  // 2. Nếu hết hạn, refresh tự động
  if (isTokenExpired(token)) {
    token = await refreshAccessToken(); // Gọi /api/auth/refresh
  }
  
  // 3. Thêm Authorization header
  const headers = {
    ...options?.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // 4. Gửi request
  const response = await fetch(path, {
    ...options,
    headers
  });
  
  return response.json();
}
```

### Bước 5️⃣ - Next.js Proxy Route

**File:** `app/api/carts/add/route.ts`

```typescript
export async function POST(req: Request) {
  // 1. Lấy token từ cookies
  const token = req.cookies.get('access_token')?.value;
  
  if (!token) {
    return NextResponse.json(
      { error: 'Authorization required' },
      { status: 401 }
    );
  }
  
  // 2. Forward request đến backend
  const response = await fetch('http://localhost:8083/carts/add', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(await req.json())
  });
  
  return response;
}
```

### Bước 6️⃣ - Backend xử lý & trả về

**Backend (Java, port 8083):**

```java
@PostMapping("/carts/add")
public ResponseEntity<CartItemResponse> addToCart(
    @RequestBody AddToCartRequest request,
    @RequestHeader("Authorization") String token
) {
  // 1. Verify token
  User user = jwtService.validateToken(token);
  
  // 2. Business logic
  CartItem item = cartService.addItem(
    user.getId(),
    request.getProductId(),
    request.getQuantity()
  );
  
  // 3. Return response
  return ResponseEntity.ok(
    new CartItemResponse(item)
  );
}
```

### Bước 7️⃣ - Response quay về Frontend

**Response JSON:**
```json
{
  "status": 200,
  "message": "Item added to cart",
  "data": {
    "cartItemId": "ci123",
    "productId": "p1",
    "productName": "Nike Shoes",
    "quantity": 1,
    "price": 100000
  }
}
```

### Bước 8️⃣ - Validate Response & Cache Update

**File:** `infrastructure/repositories/cart/cart.repository.ts`

```typescript
// Response validation
const result = CartItemResponseSchema.parse(response.data);
// ✅ Nếu valid, return
// ❌ Nếu invalid, throw ValidationError
return result;
```

**File:** `presentation/hooks/use-cart.ts`

```typescript
onSuccess: () => {
  // 1. Xóa cache cũ
  queryClient.invalidateQueries({ 
    queryKey: ['cart'] 
  });
  
  // 2. TanStack Query tự động refetch
  // useCartQuery() sẽ gọi CartRepository.getCart() lại
}
```

### Bước 9️⃣ - UI Re-render

Component sẽ re-render khi:
- Số lượng giỏ hàng thay đổi
- Cart items list cập nhật
- Toast notification hiện

---

## 📋 Ví Dụ 2: Đăng Nhập Người Dùng

### Luồng Chi Tiết

```typescript
// 1️⃣ User nhập email & password vào form
<input type="email" name="email" />
<input type="password" name="password" />

// 2️⃣ Submit form → gọi mutation
mutation.mutate({ email, password })
  
// 3️⃣ Hook gọi Use-Case
LoginUseCase.execute({ email, password })

// 4️⃣ Use-Case gọi repository
AuthRepository.login(credentials)

// 5️⃣ Repository validate & gọi HTTP
const response = await fetchWithToken('/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials)
})

// 6️⃣ Response có token & user info
{
  accessToken: "eyJhbG...",
  refreshToken: "eyJhbG...",
  user: { id: 1, email: "user@example.com", role: "USER" }
}

// 7️⃣ Repository lưu token vào cookies
authStorage.setTokens(accessToken, refreshToken)

// 8️⃣ Update global state
authStore.setUser(user)
authStore.setIsLoggedIn(true)

// 9️⃣ Redirect đến trang chủ
router.push("/")

// 🔟 UI update tự động
// Avatar hiện thị, Login button biến mất
```

---

## 💾 State Management Flow

### Server State (TanStack Query)

```typescript
// Thế nào là "Server State"?
// - Dữ liệu từ backend (products, orders, user profile)
// - Có thể out-of-sync với UI
// - Cần caching & auto-refetch

const { data: products, isLoading, error } = useProductList({
  page: 1,
  size: 10
});
// ↓ Internally:
// 1. TanStack Query check cache
// 2. Nếu cache hợp lệ, return ngay
// 3. Nếu cache hết hạn, gọi API mới
// 4. Validate response với Zod
// 5. Store vào React Query cache
// 6. Return data + loading + error state
```

### Client State (Zustand)

```typescript
// Thế nào là "Client State"?
// - UI state (sidebar collapsed, theme)
// - Auth state (user, token, isLoggedIn)
// - Không từ backend, không cần refetch

const { user, isLoggedIn, logout } = useAuthStore();
// ↓ Directly reads from global state:
// - Không gọi API
// - Subscribe tới changes
// - Re-render tự động khi state change
```

---

## 🔀 Error Handling Flow

### Khi HTTP Request Fail

```
Backend returns error
       ↓
fetchWithToken() catches error
       ↓
api-error-mapper.ts converts to Domain Error
  - 401 → AuthenticationError
  - 403 → AuthorizationError
  - 404 → NotFoundError
  - 5xx → ServerError
       ↓
Repository throws Domain Error
       ↓
Hook catches error (onError callback)
       ↓
Display toast.error(error.message)
```

### Ví Dụ Code:

```typescript
// Repository
async addToCart(payload) {
  try {
    const response = await fetchWithToken('/carts/add', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return CartResponseSchema.parse(response.data);
  } catch (error) {
    // error-mapper converts to domain error
    throw mapHttpError(error);
  }
}

// Hook
const mutation = useMutation({
  mutationFn: (payload) => CartRepository.addToCart(payload),
  onError: (error) => {
    if (error instanceof AuthenticationError) {
      // Redirect to login
      router.push('/login');
    } else if (error instanceof ValidationError) {
      // Show form errors
      setFormErrors(error.details);
    } else {
      // Generic error message
      toast.error(error.message);
    }
  }
});
```

---

## 🔐 Token Refresh Flow

### Khi Token Hết Hạn

```
User makes API request
       ↓
fetchWithToken() checks if token expired
       ↓
Token is expired
       ↓
Call refreshAccessToken()
       ↓
POST /api/auth/refresh-token
  with refreshToken in body
       ↓
Backend returns new accessToken
       ↓
Save new token to cookies
       ↓
Retry original request with new token
       ↓
Return response to caller
```

**Code in `fetch-with-token.ts`:**

```typescript
export async function fetchWithToken(path: string, options?: RequestInit) {
  let token = authStorage.getAccessToken();
  
  // Check if expired
  if (isTokenExpired(token)) {
    try {
      // Refresh automatically
      token = await refreshAccessToken();
    } catch (error) {
      // Refresh failed → redirect to login
      router.push('/login?error=session_expired');
      throw error;
    }
  }
  
  // Add token to headers & proceed
  const headers = {
    ...options?.headers,
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(path, { ...options, headers });
  return response.json();
}
```

---

## 📊 Cache Invalidation Strategy

### Khi nào trị giỏ hàng được Update?

```typescript
// Mutation hook
onSuccess: () => {
  // 1. Xóa cache queries liên quan
  queryClient.invalidateQueries({ 
    queryKey: ['cart'],
    exact: false // Xóa tất cả queries bắt đầu bằng 'cart'
  });
  
  // 2. TanStack Query tự động:
  //    - Set loading state
  //    - Call useCartQuery() lại
  //    - Validate response
  //    - Update cache
  //    - Re-render components using this query
}
```

### Ví Dụ: Thêm vào giỏ

```typescript
useAddToCartMutation() {
  return useMutation({
    mutationFn: CartRepository.addToCart,
    onSuccess: () => {
      // Invalidate cart-related queries:
      // - ['cart']
      // - ['cart', 'detail']
      // - ['cart', 'price']
      // → Tất cả đều re-fetch
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
}

// Có effect ngay lập tức:
useCartQuery(); // ← API tự động được gọi lại
useCalculatePriceQuery(); // ← Giá tính lại
```

---

## 🚦 Loading & Error States

```
Component renders
       ↓
┌──────────────────────────────┐
│   Hook returns:              │
│   - isLoading: true          │
│   - data: undefined          │
│   - error: null              │
└──────────────────────────────┘
       ↓
Render Loading Skeleton
       ↓
API query completes
       ↓
┌──────────────────────────────┐
│   Hook returns:              │
│   - isLoading: false         │
│   - data: { ... }            │
│   - error: null              │
└──────────────────────────────┘
       ↓
Render Data
       ↓
API query fails
       ↓
┌──────────────────────────────┐
│   Hook returns:              │
│   - isLoading: false         │
│   - data: undefined          │
│   - error: AppError          │
└──────────────────────────────┘
       ↓
Render Error Message
```

---

## 🎯 Key Takeaways

1. **UI** → **Hooks** → **Repositories** → **HTTP** → **Backend**
2. **Response** → **Validation** → **Cache Update** → **Re-render**
3. **Error Mapping:** HTTP error → Domain error → UI message
4. **Token:** Tự động refresh khi hết hạn, không cần user can thiệp
5. **Caching:** TanStack Query quản lý, giảm API calls
6. **State Split:** Server state (TanStack Query) vs Client state (Zustand)

---

**Last Updated:** March 5, 2026

