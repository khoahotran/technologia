# Error Handling Deep Dive

**Mục đích:** Hiểu rõ error hierarchy, xử lý lỗi, và debugging strategy.

---

## 🏗️ Error Hierarchy

```
Error (JavaScript Native)
├── AppError (Custom Base)
│   ├── ValidationError
│   ├── NetworkError
│   ├── AuthenticationError
│   ├── AuthorizationError
│   ├── NotFoundError
│   ├── ServerError
│   └── UnexpectedError (catch-all)
```

---

## 📍 Error Classes

### Domain Layer (domain/errors/)

```typescript
// domain/errors/errors.ts

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super('VALIDATION_ERROR', message, 400, context);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super('NETWORK_ERROR', message, 0, context);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super('AUTH_ERROR', message, 401, context);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super('FORBIDDEN_ERROR', message, 403, context);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super('NOT_FOUND', message, 404, context);
    this.name = 'NotFoundError';
  }
}

export class ServerError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super('SERVER_ERROR', message, 500, context);
    this.name = 'ServerError';
  }
}
```

---

## 🔄 Error Flow

```
┌─────────────────────────────────────┐
│  HTTP Request (axios/fetch)         │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  API Handler (lib/api-handler.ts)   │
│  - Check response.status            │
│  - Map to AppError                  │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Repository (infrastructure/)        │
│  - Catch AppError or NetworkError   │
│  - Validate response schema         │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  safe() Utility (lib/result.ts)     │
│  - Go-style error handling          │
│  - Return [data, error]             │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Component/Hook (presentation/)     │
│  - Check error, display to user     │
└─────────────────────────────────────┘
```

---

## 🛠️ Error Mapping

### HTTP Status → AppError

```typescript
// lib/api-handler.ts

export function mapHttpError(
  status: number,
  message: string = 'Unknown error',
  data?: any
): AppError {
  switch (status) {
    case 400:
      return new ValidationError(
        data?.message || message,
        { originalData: data }
      );
    
    case 401:
      return new AuthenticationError(
        data?.message || 'Your session expired. Please login again.'
      );
    
    case 403:
      return new AuthorizationError(
        data?.message || 'You do not have permission.'
      );
    
    case 404:
      return new NotFoundError(
        data?.message || 'Resource not found.'
      );
    
    case 500:
    case 502:
    case 503:
      return new ServerError(
        data?.message || 'Server error. Please try again later.'
      );
    
    case 0: // Network error
      return new NetworkError(
        'Network connection failed. Check your internet.'
      );
    
    default:
      return new ServerError(message);
  }
}

// Usage
try {
  const response = await axios.get('/products');
} catch (error) {
  if (error.response) {
    // Server responded with error status
    throw mapHttpError(
      error.response.status,
      error.response.data?.message,
      error.response.data
    );
  } else if (error.request) {
    // Request made but no response
    throw new NetworkError('Server did not respond');
  } else {
    // Something else happened
    throw new UnexpectedError('Unknown error', { originalError: error });
  }
}
```

---

## 🚀 Implementation Pattern: go-style Error Handling

### The safe() Utility

```typescript
// lib/result.ts

export type Result<T> = [data: T, error: null] | [data: null, error: AppError];

export async function safe<T>(
  promise: Promise<T>
): Promise<Result<T>> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    if (error instanceof AppError) {
      return [null, error];
    }
    
    // Wrap unexpected errors
    return [null, new UnexpectedError(
      'An unexpected error occurred',
      { originalError: error }
    )];
  }
}
```

### Using safe()

```typescript
// Typical pattern - clean & readable
const [cart, err] = await safe(CartRepository.getCart());

if (err) {
  // Handle error
  if (err instanceof AuthenticationError) {
    // Redirect to login
  } else if (err instanceof ValidationError) {
    // Show validation message
  } else {
    // Generic error handling
  }
  return;
}

// Use cart safely (type-safe)
console.log(cart.items);
```

---

## 🎯 Error Handling by Layer

### Domain Layer

```typescript
// domain/entities/Product.ts

export class Product {
  static create(data: unknown): [Product | null, AppError | null] {
    // Validate with Zod
    const result = ProductSchema.safeParse(data);
    
    if (!result.success) {
      return [null, new ValidationError(
        'Invalid product data',
        { errors: result.error.flatten() }
      )];
    }
    
    return [new Product(result.data), null];
  }
}
```

### Application Layer (Use Cases)

```typescript
// application/use-cases/auth/LoginUseCase.ts

export class LoginUseCase {
  static async execute(email: string, password: string) {
    // Validate input
    const [_, validErr] = LoginUseCase.validateInput(email, password);
    if (validErr) return [null, validErr];
    
    // Call repository
    const [token, repoErr] = await safe(
      AuthRepository.login(email, password)
    );
    if (repoErr) return [null, repoErr];
    
    // Process result
    const [product, entityErr] = Token.create(token);
    if (entityErr) return [null, entityErr];
    
    return [product, null];
  }
  
  private static validateInput(email: string, password: string) {
    if (!email?.includes('@')) {
      return [null, new ValidationError('Invalid email format')];
    }
    if (password.length < 6) {
      return [null, new ValidationError('Password too short')];
    }
    return [true, null];
  }
}
```

### Infrastructure Layer (Repositories)

```typescript
// infrastructure/repositories/auth/auth.repository.ts

export class AuthRepository {
  static async login(email: string, password: string): Promise<LoginToken> {
    try {
      const response = await axios.post('/auth/login', {
        username: email,
        password
      });
      
      // Validate response
      const [token] = Token.create(response.data);
      if (!token) throw new ValidationError('Invalid response');
      
      return token;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.response?.status === 401) {
        throw new AuthenticationError('Invalid credentials');
      }
      throw mapHttpError(error.response?.status, error.message);
    }
  }
}
```

### Presentation Layer (Components/Hooks)

```typescript
// app/(auth)/login/page.tsx

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  
  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    const [token, err] = await safe(
      LoginUseCase.execute(email, password)
    );
    
    if (err) {
      // Map to user-friendly message
      if (err instanceof ValidationError) {
        setError(t('error.validation.invalidEmail'));
      } else if (err instanceof AuthenticationError) {
        setError(t('error.auth.invalidCredentials'));
      } else if (err instanceof NetworkError) {
        setError(t('error.network.offline'));
      } else {
        setError(t('error.generic.tryAgain'));
      }
      setLoading(false);
      return;
    }
    
    // Success - save token and redirect
    await authStorage.setToken(token.accessToken);
    router.push('/');
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      handleLogin(
        form.get('email') as string,
        form.get('password') as string
      );
    }}>
      {error && <Alert.error>{error}</Alert.error>}
      {/* form fields */}
    </form>
  );
}
```

---

## 🎨 React Hook Pattern

### useAsync Hook

```typescript
// presentation/hooks/use-async.ts

interface UseAsyncState<T> {
  status: 'idle' | 'pending' | 'success' | 'error';
  data: T | null;
  error: AppError | null;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
): UseAsyncState<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    status: 'idle',
    data: null,
    error: null
  });
  
  useEffect(() => {
    if (!immediate) return;
    
    const execute = async () => {
      setState({ status: 'pending', data: null, error: null });
      
      const [data, err] = await safe(asyncFunction());
      
      if (err) {
        setState({ status: 'error', data: null, error: err });
      } else {
        setState({ status: 'success', data, error: null });
      }
    };
    
    execute();
  }, [immediate]);
  
  return state;
}

// Usage
export function useProductList() {
  return useAsync(() => ProductRepository.getList());
}

// In component
const { status, data, error } = useProductList();

if (status === 'pending') return <Skeleton />;
if (error) return <ErrorAlert error={error} />;
return <ProductList products={data} />;
```

---

## 🐛 Debugging Strategies

### 1. Enable Debug Mode

```typescript
// lib/constants.ts
export const DEBUG = process.env.NODE_ENV === 'development';

// In any file
if (DEBUG) {
  console.log('Product fetched:', product);
  console.log('Error details:', error.context);
}
```

### 2. Error Boundary

```typescript
// components/ErrorBoundary.tsx

export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Send to logging service
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200">
          <h2>Something went wrong</h2>
          <details className="mt-2 text-xs">
            <summary>Error details (dev only)</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrap app
export default function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### 3. Network Tab

```
1. Open DevTools (F12)
2. Go to Network tab
3. Make request
4. Click request to see:
   - Status code
   - Response headers
   - Response body (actual error)
```

### 4. Console Logging

```typescript
// ✅ Good: Structured logging
console.error('Failed to fetch product', {
  productId: '123',
  error: err,
  retryCount: 3
});

// ❌ Bad: Unclear
console.log('err');
console.log(error);
```

---

## ✅ Common Error Patterns

### Pattern 1: Retry on Network Error

```typescript
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (!(err instanceof NetworkError) || i === maxRetries - 1) {
        throw err;
      }
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Pattern 2: Fallback Error Data

```typescript
const [products, err] = await safe(ProductRepository.getList());

if (err) {
  console.warn('Failed to fetch products, using cache');
  // Return cached products instead of showing error
  return getCachedProducts();
}

return products;
```

### Pattern 3: Grouped Error Handling

```typescript
const [data, err] = await safe(someAsyncFunction());

if (err instanceof NetworkError) {
  // Show "Check your internet" message
} else if (err instanceof AuthenticationError) {
  // Redirect to login
} else if (err instanceof ValidationError) {
  // Show form errors
} else {
  // Generic error handler
}
```

---

## 📊 Error Status Codes

| Code | Meaning | Recovery |
|------|---------|----------|
| 400 | Bad request | Show validation errors |
| 401 | Not authenticated | Redirect to login |
| 403 | Not authorized | Show "Access denied" |
| 404 | Not found | Show "Not found" page |
| 500 | Server error | Retry or show error |
| Network | Offline | Show offline message |

---

## 🔗 Error in Tests

```typescript
it('should handle authentication error', async () => {
  vi.mocked(AuthRepository.login).mockRejectedValue(
    new AuthenticationError('Invalid credentials')
  );
  
  const [token, err] = await safe(
    LoginUseCase.execute('user@test.com', 'wrong')
  );
  
  expect(token).toBeNull();
  expect(err).toBeInstanceOf(AuthenticationError);
  expect(err?.message).toBe('Invalid credentials');
});
```

---

**Last Updated:** March 5, 2026

