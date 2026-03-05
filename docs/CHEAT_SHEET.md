# Cheat Sheet - Gợi Ý Nhanh & Code Snippets

**Mục đích:** Quick reference cho các pattern, command, và code snippet thường dùng.

---

## 🚀 Command Cheat Sheet

### Setup & Installation
```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Testing & Linting
```bash
# Run tests (interactive)
pnpm test

# Run tests once
pnpm test -- --run

# Run specific test
pnpm test -- ProductDetail.test.tsx --run

# Run with coverage
pnpm test -- --coverage --run

# Lint code
pnpm lint

# Format code
pnpm format
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feat/feature-name

# Stage & commit
git add .
git commit -m "feat(scope): description"

# Push to remote
git push -u origin feat/feature-name

# Fetch updates
git fetch upstream
git rebase upstream/main

# Delete local branch
git branch -d feat/feature-name
```

---

## 📝 TypeScript Types Cheat Sheet

### Common Interfaces

```typescript
// Product
interface Product {
  productId: string;
  name: string;
  displayPrice: number;
  description: string;
  category: string;
  brandName: string;
  totalStock: number;
  averageRating: number;
  variants: Variant[];
}

// User
interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatar?: string;
}

// Cart
interface Cart {
  cartId: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

// CartItem
interface CartItem {
  cartItemId: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
}

// API Response
interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  errors?: Record<string, string>;
}

// Pagination
interface Paginated<T> {
  items: T[];
  page_number: number;
  page_size: number;
  count_items: number;
  count_pages: number;
}
```

---

## 🔧 Common Patterns

### Pattern 1: Repository Pattern

```typescript
// 1. Define interface (domain)
export interface IProductRepository {
  getById(id: string): Promise<Product>;
  getList(params: GetListParams): Promise<Paginated<Product>>;
}

// 2. Implement repository (infrastructure)
export class ProductRepository implements IProductRepository {
  static async getById(id: string): Promise<Product> {
    const response = await fetchWithToken(`/products/${id}`);
    return ProductSchema.parse(response.data);
  }
}

// 3. Use in component (presentation)
const { data: product } = useQuery({
  queryKey: ['product', id],
  queryFn: () => ProductRepository.getById(id)
});
```

### Pattern 2: Error Handling (go-style)

```typescript
// Function returns [data, error]
async function fetchData() {
  const [data, err] = await safe(apiCall());
  
  if (err) {
    if (err instanceof ValidationError) {
      // handle validation
    } else if (err instanceof NetworkError) {
      // handle network
    }
    return;
  }
  
  // Use data safely
  console.log(data);
}
```

### Pattern 3: TanStack Query

```typescript
// Query (read data)
const { data, isLoading, error } = useQuery({
  queryKey: ['products', page],
  queryFn: () => ProductRepository.getList({ page })
});

// Mutation (write data)
const { mutate, isPending } = useMutation({
  mutationFn: (product) => ProductRepository.create(product),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }
});
```

### Pattern 4: Zustand State

```typescript
// Create store
import create from 'zustand';

export const useUserStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null })
}));

// Use in component
const user = useUserStore((state) => state.user);
const setUser = useUserStore((state) => state.setUser);
```

### Pattern 5: Form Handling

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });
  
  const onSubmit = (data) => {
    // submit data
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

---

## 🎨 React Component Patterns

### Functional Component

```typescript
interface Props {
  productId: string;
  onSelect?: (id: string) => void;
}

export function ProductCard({ productId, onSelect }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: product, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => ProductRepository.getById(productId)
  });
  
  if (error) return <ErrorAlert error={error} />;
  if (!product) return <Skeleton />;
  
  return (
    <div onClick={() => onSelect?.(productId)}>
      <h3>{product.name}</h3>
      <p>{formatPrice(product.displayPrice)}</p>
    </div>
  );
}
```

### Custom Hook

```typescript
export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => ProductRepository.getById(id),
    staleTime: 5 * 60 * 1000  // 5 minutes
  });
}

// Usage
function ProductPage() {
  const { data, isLoading, error } = useProductDetail('p123');
}
```

### HOC (Higher-Order Component)

```typescript
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const user = useUserStore(state => state.user);
    
    if (!user) {
      return <Redirect to="/login" />;
    }
    
    return <Component {...props} />;
  };
}

// Usage
export default withAuth(AdminPage);
```

---

## 🧪 Testing Cheat Sheet

### Unit Test

```typescript
describe('formatPrice', () => {
  it('should format price correctly', () => {
    expect(formatPrice(1000000)).toBe('1,000,000₫');
  });
});
```

### Component Test

```typescript
it('should render and handle click', async () => {
  const { user } = render(<Button onClick={vi.fn()}>Click</Button>);
  await user.click(screen.getByText('Click'));
  expect(vi.mocked(onClick)).toHaveBeenCalled();
});
```

### Hook Test

```typescript
it('should return loading then data', async () => {
  const { result } = renderHook(() => useProductDetail('p1'));
  
  expect(result.current.isLoading).toBe(true);
  
  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

### Async Test

```typescript
it('should handle async action', async () => {
  const [data, err] = await safe(someAsyncFn());
  expect(data).toBeDefined();
  expect(err).toBeNull();
});
```

---

## 🌐 API Integration Cheat Sheet

### Fetch with Auth

```typescript
// lib/fetch-auth.ts
export async function fetchWithToken(
  url: string,
  options: RequestInit = {}
) {
  const token = await authStorage.getToken();
  
  return fetch(`/api${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });
}
```

### Repository Call

```typescript
const [product, err] = await safe(
  ProductRepository.getById('p123')
);

if (err) {
  console.error('Failed to load product:', err);
  return;
}

console.log('Product:', product);
```

### Common Status Codes

```
200 - OK
201 - Created
400 - Bad Request (validation error)
401 - Unauthorized (not logged in)
403 - Forbidden (no permission)
404 - Not Found
500 - Server Error
```

---

## 📦 Next.js Specific

### API Route

```typescript
// app/api/products/[id]/route.ts
export async function GET(request: Request) {
  const id = request.nextUrl.searchParams.get('id');
  const [product, err] = await safe(ProductRepository.getById(id));
  
  if (err) return NextResponse.json({ error: err.message }, { status: 400 });
  return NextResponse.json(product);
}
```

### Server Action

```typescript
// app/actions/create-product.ts
'use server';

export async function createProduct(formData: FormData) {
  const name = formData.get('name');
  const [product, err] = await safe(ProductRepository.create({ name }));
  
  return { product, error: err };
}
```

### Middleware

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

---

## 🎯 Localization (i18n) Cheat Sheet

### Use Translations in Component

```typescript
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('page.heading')}</h1>
      <button>{t('button.submit')}</button>
    </div>
  );
}
```

### Translation Files

```json
// locales/en.json
{
  "page": {
    "heading": "Welcome"
  },
  "button": {
    "submit": "Submit",
    "cancel": "Cancel"
  },
  "error": {
    "validation": "Validation failed",
    "network": "Network error"
  }
}
```

---

## 🔍 Debugging Cheat Sheet

### Console Logging

```typescript
// ✅ Good: Structured
console.log('Fetching product', { id, retryCount });

// ❌ Bad: Unclear
console.log(product);
```

### Browser DevTools

```
1. F12 to open DevTools
2. Console tab - check for errors
3. Network tab - inspect requests/responses
4. Application tab - check localStorage/cookies
5. Elements tab - check HTML structure
```

### VS Code Debugging

```typescript
// Add breakpoint (click line number)
// Press F5 to start debugger
// Use console in debug panel
```

---

## 📋 Common Mistakes & Fixes

| Mistake | Fix |
|---------|-----|
| Calling `/products` instead of `/api/products` | Always prefix API calls with `/api` |
| Forgetting `await` on async function | Use `await` or `.then()` |
| Not checking if error is undefined | Always check `if (err)` before using |
| Hardcoding strings in UI | Use `t()` for translations |
| Missing dependency in useEffect | Add all used variables to dependency array |
| Using `any` type everywhere | Use proper TypeScript types |
| Not handling errors | Wrap async calls with `safe()` or try-catch |

---

## 🎓 Learning Path Quick Links

1. **Beginner?** → [GETTING_STARTED.md](./GETTING_STARTED.md)
2. **Understand architecture?** → [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Need API docs?** → [API_ROUTES.md](./API_ROUTES.md)
4. **Writing tests?** → [TESTING_GUIDE.md](./TESTING_GUIDE.md)
5. **Making PR?** → [CONTRIBUTING.md](./CONTRIBUTING.md)
6. **Got error?** → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

**Last Updated:** March 5, 2026

