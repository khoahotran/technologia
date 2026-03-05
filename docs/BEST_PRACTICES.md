# Best Practices & Code Style Guide

**Mục đích:** Quy tắc viết code, naming conventions, patterns phổ biến.

---

## ✅ Code Style & Formatting

### TypeScript Types

```typescript
// ✅ GOOD: Declare types explicitly
interface IUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

const user: IUser = { id: '1', email: 'test@example.com', role: 'user' };

// ❌ BAD: Using 'any'
const user: any = { /*...*/ };

// ❌ BAD: Missing type annotation
const user = { /*...*/ };
```

### Naming Conventions

```typescript
// Classes & Interfaces: PascalCase
class ProductRepository { }
interface IProductRepository { }

// Functions & variables: camelCase
function getUserById(id: string) { }
const userEmail = 'test@example.com';

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:3000';
const DEFAULT_PAGE_SIZE = 10;

// Files
ProductRepository.ts        // ✅ Class/Interface
product.repository.ts       // ✅ Concrete impl
useProductList.ts           // ✅ Hooks
product.schema.ts           // ✅ Zod schemas
product.entity.test.ts      // ✅ Test files
```

### Null/Undefined Handling

```typescript
// ✅ GOOD: Type-safe null checking
const email = user?.email ?? 'no-email@example.com';

// ✅ GOOD: Optional chaining
const city = user?.address?.city;

// ✅ GOOD: Nullish coalescing
const size = pageSize || 10; // If explicit false or 0, defaults to 10

// ❌ BAD: Unsafe access
const city = user.address.city; // Crash if user.address is null

// ❌ BAD: Loose equality
if (value == null) { } // Catch both null & undefined, hard to debug
```

---

## 📦 Import Organization

```typescript
// Order imports this way:

// 1. External libraries
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

// 2. Absolute imports (from tsconfig paths)
import { UserRepository } from '@/infrastructure/repositories/user/user.repository';
import { useAuth } from '@/presentation/hooks/use-auth';
import { formatCurrency } from '@/shared/utils/format';

// 3. Relative imports (last resort)
import { ProductCard } from '../ProductCard';

// ✅ GOOD: Group & sort imports
import type { IUser, IProduct } from '@/domain';
import { UserRepository, ProductRepository } from '@/infrastructure/repositories';

// ❌ BAD: Mixed order
import { Component } from 'relative';
import { External } from 'external';
import { Absolute } from '@/absolute';
```

---

## 🔄 Component Structure

### Function Component

```typescript
// ✅ GOOD: Clear structure
interface ProductCardProps {
  productId: string;
  onSelect?: (id: string) => void;
}

export function ProductCard({
  productId,
  onSelect
}: ProductCardProps) {
  // 1. Hooks (useState, useQuery, etc)
  const { data: product, isLoading } = useProductDetail(productId);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 2. Derived state
  const discountedPrice = product?.price ?? 0 * 0.9;
  
  // 3. Event handlers
  const handleClick = () => {
    onSelect?.(productId);
  };
  
  // 4. Effects (side effects)
  useEffect(() => {
    // Track view
  }, [productId]);
  
  // 5. Early returns for loading/error
  if (isLoading) return <LoadingSkeleton />;
  if (!product) return <NotFound />;
  
  // 6. Render
  return (
    <div onClick={handleClick}>
      <h3>{product.name}</h3>
      <p>{formatCurrency(discountedPrice)}</p>
    </div>
  );
}
```

### React.memo for Performance

```typescript
// ✅ Use useMemo for expensive computations
const memoizedValue = useMemo(
  () => expensiveCalculation(data),
  [data]
);

// ✅ Use useCallback to prevent re-renders
const handleClick = useCallback(
  (id: string) => {
    addToCart(id);
  },
  [addToCart]
);

// ✅ Use React.memo for component memoization
const ProductCard = React.memo(function ({ product, onSelect }: Props) {
  return <div onClick={() => onSelect(product.id)}>{product.name}</div>;
});

// ❌ DON'T prop drill
<GrandChild prop={prop} onChange={onChange} />
// ✅ USE state management
const { prop, onChange } = useStore();
```

---

## 🐛 Error Handling

### Try-Catch Pattern

```typescript
// ✅ GOOD: Go-style error handling
const [data, err] = await safe(
  UserRepository.getById(id)
);

if (err) {
  if (err instanceof AuthenticationError) {
    // Handle auth
  } else if (err instanceof NotFoundError) {
    // Handle not found
  }
  return;
}

// Use data safely
console.log(data.name);

// ❌ BAD: Deep try-catch nesting
try {
  const data = await fetch(...);
  try {
    const parsed = JSON.parse(data);
    try {
      const result = processData(parsed);
      // ...
    } catch(e3) { }
  } catch(e2) { }
} catch(e) { }
```

### Error Messages

```typescript
// ✅ GOOD: Descriptive error messages
throw new ValidationError(
  'Email format invalid',
  'field_email'
);

// ✅ GOOD: Include context
throw new NotFoundError(
  `Product with ID ${productId} not found`
);

// ❌ BAD: Vague messages
throw new Error('Error');
throw new Error('Failed');

// ❌ BAD: Overly technical
throw new Error('TypeError: Cannot read property "address" of undefined');
```

---

## 📝 JSDoc Comments

```typescript
/**
 * Fetches and filters products based on search criteria.
 * 
 * @param params - Search parameters containing keyword, filters, pagination
 * @param params.keyword - Search term (case-insensitive)
 * @param params.page - Page number (0-indexed)
 * @param params.size - Items per page
 * @returns Promise resolving to paginated products list
 * @throws {ValidationError} If params invalid
 * @throws {NetworkError} If network unavailable
 * 
 * @example
 * const results = await productRepo.searchAndFilter({
 *   keyword: 'nike shoes',
 *   page: 0,
 *   size: 10
 * });
 * console.log(results.items); // Product[]
 */
export async function searchAndFilter(
  params: ProductSearchParams
): Promise<PaginatedResponse<Product>> {
  // ...
}
```

---

## 🧪 Testing Best Practices

### Test Structure

```typescript
// ✅ GOOD: Clear test structure
describe('ProductRepository', () => {
  describe('getById', () => {
    it('should return product when exists', async () => {
      // Arrange
      const mockResponse = { id: '1', name: 'Product' };
      mockFetch.mockResolvedValueOnce({ data: mockResponse });
      
      // Act
      const product = await ProductRepository.getById('1');
      
      // Assert
      expect(product.id).toBe('1');
      expect(mockFetch).toHaveBeenCalledWith('/products/1');
    });
    
    it('should throw NotFoundError when not exists', async () => {
      mockFetch.mockRejectedValueOnce(new Error('404'));
      
      expect(() => ProductRepository.getById('999'))
        .rejects
        .toThrow(NotFoundError);
    });
  });
});

// ❌ BAD: Unclear tests
it('test1', async () => {
  // What are we testing?
  expect(result).toBe(true);
});
```

### Test Isolation

```typescript
// ✅ GOOD: Isolated unit test
const repo = new ProductRepository();
const result = await repo.getById('1');

// ✅ GOOD: Mock external dependencies
vi.mock('@/infrastructure/http/client');
const mockHttpClient = vi.mocked(httpClient);

// ❌ BAD: Test depends on previous test
// (relying on state from test1 in test2)

// ❌ BAD: Testing impl details instead of behavior
expect(internalVariable).toBe(value);
```

---

## 📦 Repository Pattern

```typescript
// ✅ GOOD: Interface first (Domain)
export interface IProductRepository {
  getById(id: string): Promise<Product>;
  searchAndFilter(params: SearchParams): Promise<Product[]>;
  save(product: Product): Promise<void>;
}

// ✅ GOOD: Concrete implementation (Infrastructure)
export class ProductRepository implements IProductRepository {
  async getById(id: string): Promise<Product> {
    const response = await fetchWithToken(`/products/${id}`);
    const validated = ProductSchema.parse(response.data);
    return validated;
  }
  
  async searchAndFilter(params: SearchParams) {
    // Implementation
  }
  
  async save(product: Product) {
    // Implementation
  }
}

// ✅ GOOD: Use interface in application layer
class SearchProductsUseCase {
  constructor(private repo: IProductRepository) { }
  
  async execute(params: SearchParams) {
    return this.repo.searchAndFilter(params);
  }
}

// ❌ BAD: Concrete dependency (tight coupling)
class Component {
  constructor(private repo: ProductRepository) { }
}
```

---

## 🔐 Authentication & Token

```typescript
// ✅ GOOD: Token stored in HTTPOnly cookies (secure)
// Backend sets: Set-Cookie: access_token=...; HttpOnly; Secure

// ✅ GOOD: Automatic token refresh
const response = await fetchWithToken('/api/products');
// If token expired, fetchWithToken() refreshes automatically

// ❌ BAD: Token in localStorage (XSS vulnerability)
localStorage.setItem('token', token);

// ❌ BAD: Token in state (lost on refresh)
const [token, setToken] = useState('');

// ❌ BAD: Manual token refresh (error-prone)
if (response.status === 401) {
  const newToken = await refreshToken();
  // Now what? Retry original request?
}
```

---

## 🎨 Styling Conventions

```typescript
// ✅ GOOD: Tailwind classes organized
<div className="
  flex items-center justify-between
  gap-4 p-4
  bg-white rounded-lg shadow-sm
  hover:shadow-md transition-shadow
  dark:bg-slate-900
">
  {/* Content */}
</div>

// ✅ GOOD: Extract complex classNames to const
const cardClasses = cn(
  'flex items-center justify-between',
  'gap-4 p-4',
  'bg-white rounded-lg shadow-sm',
  'hover:shadow-md transition-shadow',
  'dark:bg-slate-900'
);
<div className={cardClasses} />

// ❌ BAD: Long className string
<div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900">

// ❌ BAD: Inline styles
<div style={{ color: 'red', fontSize: '16px' }} />
```

---

## 🔄 State Management

```typescript
// ✅ GOOD: Use TanStack Query for server state
const { data: products } = useProductList();

// ✅ GOOD: Use Zustand for client state
const { user, logout } = useAuthStore();

// ✅ GOOD: Combine both
const { data: profile } = useUserProfile(); // Server state
const { user } = useAuthStore(); // Client state
const isSameUser = user.id === profile.id; // Combine

// ❌ BAD: Duplicate server state in client state
const [products, setProducts] = useState([]);
useEffect(() => {
  fetchProducts().then(setProducts); // Wrong, use TanStack Query
}, []);

// ❌ BAD: Put everything in Zustand
const store = useStore();
// All products, all orders, all filters → memory bloat
```

---

## 🚀 Performance Tips

```typescript
// ✅ GOOD: Lazy load components
const ProductDetail = dynamic(() => import('./ProductDetail'), {
  loading: () => <LoadingSkeleton />
});

// ✅ GOOD: Pagination instead of infinite scroll
const { data, page, nextPage } = useProductList({ page: 0 });

// ✅ GOOD: Debounce search input
const debouncedSearch = useDebounce(searchQuery, 500);
const { data: results } = useProductSearch(debouncedSearch);

// ❌ BAD: Load all at once
const [allProducts, setAllProducts] = useState([]);
useEffect(() => {
  fetchAllProducts().then(setAllProducts); // 10,000 items?
}, []);

// ❌ BAD: Search on every keystroke
const { data } = useProductSearch(searchQuery);
```

---

## 📋 Code Review Checklist

- [ ] Types are explicit (no `any`)
- [ ] Error handling present
- [ ] Comments/JSDoc for complex logic
- [ ] Test coverage > 80%
- [ ] No prop drilling (use context/store)
- [ ] No `console.log()` left (use logger)
- [ ] No hardcoded values (use constants)
- [ ] Performance optimized (memo, callback)
- [ ] No unused imports/variables
- [ ] Naming is clear & consistent

---

**Last Updated:** March 5, 2026

