# Hướng Dẫn Xử Lý Sự Cố (Troubleshooting Guide)

**Mục đích:** Giải quyết các vấn đề phổ biến khi phát triển.

---

## 🔴 Lỗi: Cannot GET /api/products

### Triệu Chứng
```
❌ GET http://localhost:3000/api/products
   Response: 404 Not Found
```

### Nguyên Nhân
- Backend service không chạy
- API Proxy route chưa cấu hình
- next.config.mjs rewrites sai

### Giải Pháp

**Bước 1:** Kiểm tra backend service chạy

```bash
# Check if Product Service is running on port 8082
curl http://localhost:8082/health

# If error, start Product Service in separate terminal
# (check backend repo for startup instructions)
```

**Bước 2:** Kiểm tra next.config.mjs

```javascript
// File: next.config.mjs
export default {
  async rewrites() {
    return {
      beforeFiles: [
        // ✅ ADD THIS
        {
          source: '/api/products/:path*',
          destination: 'http://localhost:8082/products/:path*'
        },
        // ... other rewrites
      ]
    };
  }
};
```

**Bước 3:** Check API route file

```typescript
// File: app/api/products/[...path]/route.ts
// Should exist and forward requests to backend

export async function GET(request: Request) {
  // Forward to backend service
}
```

**Bước 4:** Restart dev server

```bash
# Kill: Ctrl+C
pnpm dev

# Now test:
curl http://localhost:3000/api/products
```

---

## 🔴 Lỗi: 401 Unauthorized - Token Not Found

### Triệu Chứng
```
❌ POST http://localhost:3000/api/auth/login
   Response: 401 Unauthorized
   Message: "Authorization header is missing"
```

### Nguyên Nhân
- Token không được lưu vào cookies
- `authStorage.setTokens()` không chạy
- Cookies không được gửi trong request

### Giải Pháp

**Bước 1:** Kiểm tra token được save

```typescript
// File: infrastructure/persistence/storage.ts

export const authStorage = {
  setTokens(accessToken: string, refreshToken: string) {
    // ✅ MUST save to cookies (not localStorage)
    if (typeof window === 'undefined') {
      // Server-side (Next.js)
      cookies().set('access_token', accessToken);
      cookies().set('refresh_token', refreshToken);
    } else {
      // Client-side
      document.cookie = `access_token=${accessToken}; path=/`;
    }
  }
};
```

**Bước 2:** Kiểm tra login mutation

```typescript
// File: app/(auth)/login/LoginClient.tsx

const handleLogin = async () => {
  const response = await AuthRepository.login(credentials);
  
  // ✅ MUST call setTokens()
  authStorage.setTokens(
    response.accessToken,
    response.refreshToken
  );
  
  // Redirect
  router.push('/');
};
```

**Bước 3:** Kiểm tra cookies trong DevTools

```
Chrome DevTools:
1. F12 → Application
2. Cookies → http://localhost:3000
3. Check access_token & refresh_token present
4. If missing: Back to step 2, run login again
```

**Bước 4:** Kiểm tra fetch gửi cookies

```typescript
// ✅ GOOD: Fetch automatically sends cookies
const response = await fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include', // ← IMPORTANT!
  body: JSON.stringify(credentials)
});

// ❌ BAD: Cookies not sent
const response = await fetch('/api/auth/login', {
  method: 'POST',
  // credentials: 'include' missing!
});
```

---

## 🔴 Lỗi: Validation Error - Field Mismatch

### Triệu Chứng
```
❌ ValidationError: Failed to validate schema
   Expected: { id, name, price, stock }
   Received: { id, name, price }
   Missing: stock
```

### Nguyên Nhân
- Backend response không khớp với Zod schema
- Backend API changed nhưng frontend schema không updated
- Typo trong field name

### Giải Pháp

**Bước 1:** Check actual backend response

```bash
# Make direct call to backend
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8082/products/1 | jq .

# Look at actual fields in response
```

**Bước 2:** Update Zod schema

```typescript
// File: shared/validators/api-schemas.ts

// ❌ OLD: Missing 'stock'
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number()
});

// ✅ NEW: Add 'stock' field
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  stock: z.number().optional() // If optional on backend
});
```

**Bước 3:** Check response adapter

```typescript
// File: infrastructure/http/response-adapter.ts

// ✅ Map backend field names if different
export function adaptProductResponse(data: any) {
  return {
    id: data.id,
    name: data.productName, // ← If backend uses 'productName'
    price: data.displayPrice,
    stock: data.stockQuantity
  };
}
```

---

## 🔴 Lỗi: "Cannot read property 'email' of undefined"

### Triệu Chứng
```
❌ TypeError: Cannot read property 'email' of undefined
   at handleProfile (ProfilePage.tsx:42)
```

### Nguyên Nhân
- Accessing nested property without null checking
- Component renders before data loads
- API returned null/undefined

### Giải Pháp

**Bước 1:** Always null-check

```typescript
// ❌ BAD: Direct access
const email = user.profile.email;

// ✅ GOOD: Optional chaining
const email = user?.profile?.email;

// ✅ BETTER: Nullish coalescing
const email = user?.profile?.email ?? 'no-email@example.com';
```

**Bước 2:** Check loading state

```typescript
// ✅ GOOD: Wait for data before accessing
function ProfilePage() {
  const { data: user, isLoading } = useUserProfile();
  
  if (isLoading) return <LoadingSkeleton />;
  if (!user) return <NotFound />;
  
  // Now it's safe to access user properties
  return <div>{user.email}</div>;
}
```

**Bước 3:** Type-safe with TypeScript

```typescript
// ✅ GOOD: Proper typing
interface User {
  id: string;
  email: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
}

const user: User = data;
const name = user.profile?.firstName ?? 'Guest';
```

---

## 🔴 Lỗi: Tests Failing - Mock Setup

### Triệu Chứng
```
❌ FAIL useProductList.test.ts
   Expected: resolved value
   Received: undefined
```

### Nguyên Nhân
- Mock không được set up đúng
- Mock function không return value
- Async thaw test quên `await`

### Giải Pháp

**Bước 1:** Setup mock correctly

```typescript
// ❌ BAD: Mock không setup
vi.mock('@/infrastructure/http/fetch-with-token');

it('should fetch products', async () => {
  const { result } = renderHook(() => useProductList());
  // But mock never returns data!
});

// ✅ GOOD: Mock returns value
import { fetchWithToken } from '@/infrastructure/http/fetch-with-token';

vi.mock('@/infrastructure/http/fetch-with-token');
const mockFetch = vi.mocked(fetchWithToken);

beforeEach(() => {
  mockFetch.mockResolvedValueOnce({
    data: { items: [{ id: '1', name: 'Product' }] }
  });
});

it('should fetch products', async () => {
  const { result } = renderHook(() => useProductList());
  // Now mock returns data
});
```

**Bước 2:** Await async operations

```typescript
// ❌ BAD: Not waiting for async
it('should fetch data', () => {
  const { result } = renderHook(() => useProductList());
  expect(result.current.data).toBeDefined(); // Fails, still loading
});

// ✅ GOOD: Use waitFor
it('should fetch data', async () => {
  const { result } = renderHook(() => useProductList());
  
  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

---

## 🔴 Lỗi: CORS Error

### Triệu Chứng
```
❌ Access to XMLHttpRequest at 'http://localhost:8081' 
   from origin 'http://localhost:3000' has been blocked by CORS policy
```

### Nguyên Nhân
- Request quá API Proxy (hầu hết cases)
- Backend CORS không configured
- Direct call đến backend thay vì proxy

### Giải Pháp

**✅ CORRECT:** Luôn quá API Proxy

```typescript
// ✅ GOOD: Call via proxy (automatic cookies)
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials)
});

// ❌ BAD: Direct to backend (CORS error + insecure)
const response = await fetch('http://localhost:8081/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials)
});
```

**next.config.mjs setup:**

```javascript
export default {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8081/:path*'
        }
      ]
    };
  }
};
```

---

## 🔴 Lỗi: ESLint / TypeScript Compiler

### Triệu Chứng
```
❌ pnpm lint
   error: 'user' is assigned a value but never used
   error: Missing type annotation for 'obj'
```

### Giải Pháp

```bash
# Auto-fix linting issues
pnpm lint --fix

# Type-check
pnpm type-check

# Check both
pnpm lint && pnpm type-check
```

**Remove unused variable:**

```typescript
// ❌ BAD
const user = data;
// Do nothing with user

// ✅ GOOD
const { data: user } = useQuery();
// Or use underscore if intentionally unused
const { data: _user } = useQuery();
```

---

## 🟢 Debug Tips

### Browser DevTools

```javascript
// Check global state
// In Console tab, type:
window.__REACT_QUERY_DEVTOOLS__

// Check auth store
const { getState } = useAuthStore;
getState(); // View all auth state

// Check cookies
document.cookie // View all cookies
```

### Network Tab

```
1. F12 → Network
2. Filter: "api/" or "products"
3. Click request
4. Check:
   - Headers: Authorization present?
   - Response: Valid JSON?
   - Status code: 200, 401, 404?
```

### Console Logging

```typescript
// Use logger (not console.log)
import { logger } from '@/lib/logger';

logger.info('Product loaded:', product); // ✅
console.log('product'); // ❌ Linting error
```

### VS Code Debug

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js debug",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "serverReadyAction": {
        "pattern": "\\bready on\\b.*\\b([0-9]+)\\b",
        "uriFormat": "http://localhost:%s",
        "action": "openExternally"
      }
    }
  ]
}
```

---

## 📋 Common Errors Checklist

| Error | Solution |
|-------|----------|
| 404 API | Check backend running + next.config rewrites |
| 401 Auth | Check token in cookies + authStorage.setTokens() |
| Validation error | Update Zod schema to match backend |
| Undefined property | Add null checks + type safety |
| Test fails | Fix mock setup + use waitFor() |
| CORS error | Call via /api proxy, not direct backend |
| ESLint error | pnpm lint --fix |
| Type error | pnpm type-check |

---

**Last Updated:** March 5, 2026

