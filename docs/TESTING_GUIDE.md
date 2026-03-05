# Hướng Dẫn Testing (Testing Guide)

**Mục đích:** Chiến lược testing, ví dụ code, best practices.

---

## 🎯 Testing Strategy Overview

### Pyramid of Tests

```
        🔺
       /   \      1-2 E2E Tests
      /  E2E \     (User journeys)
     /_______\
      
        🔻
       /   \      10-15 Integration Tests
      /Integ\     (Use cases, repos)
     /_______\
      
      🔺🔺🔺
     /     \      60+ Unit Tests
    / Units \     (Domain, utils)
   /_______\
```

### Test Types & Coverage

| Type | Location | Tool | Coverage |
|------|----------|------|----------|
| **Unit** | `*.test.ts` | Vitest | 60% |
| **Integration** | `*.test.ts` | Vitest + MSW | 25% |
| **Component** | `*.test.tsx` | Vitest + RTL | 10% |
| **E2E** | `*.spec.ts` | Playwright | 5% |

**Target:** 80%+ overall coverage

---

## 🧪 Unit Testing (Domain Layer)

### Ví Dụ: Entity Validation

**File:** `domain/product/product.entity.ts`

```typescript
export class Product {
  constructor(
    public id: string,
    public name: string,
    public price: number
  ) {
    // Validate in constructor
    if (price < 0) {
      throw new InvalidPriceError('Price cannot be negative');
    }
    if (!name || name.trim().length === 0) {
      throw new InvalidNameError('Name is required');
    }
  }
}
```

**Test File:** `domain/product/__tests__/product.entity.test.ts`

```typescript
describe('Product Entity', () => {
  describe('constructor', () => {
    it('should create product with valid data', () => {
      // Arrange
      const data = {
        id: '1',
        name: 'Nike Shoes',
        price: 100000
      };
      
      // Act
      const product = new Product(data.id, data.name, data.price);
      
      // Assert
      expect(product.id).toBe('1');
      expect(product.name).toBe('Nike Shoes');
      expect(product.price).toBe(100000);
    });
    
    it('should throw InvalidPriceError when price is negative', () => {
      // Arrange
      // (negative price)
      
      // Act & Assert
      expect(() => {
        new Product('1', 'Product', -100);
      }).toThrow(InvalidPriceError);
    });
    
    it('should throw InvalidNameError when name is empty', () => {
      expect(() => {
        new Product('1', '', 100);
      }).toThrow(InvalidNameError);
    });
  });
});
```

### Test Utilities

```typescript
// ✅ GOOD: Helper functions
function createProduct(overrides = {}) {
  return new Product(
    overrides.id ?? '1',
    overrides.name ?? 'Test Product',
    overrides.price ?? 100000
  );
}

describe('Product', () => {
  it('should calculate discount', () => {
    const product = createProduct({ price: 100000 });
    expect(product.getDiscountedPrice(0.1)).toBe(90000);
  });
});
```

---

## 🔗 Integration Testing (Application & Infrastructure)

### Ví Dụ: Repository Testing

**File:** `infrastructure/repositories/product/__tests__/product.repository.test.ts`

```typescript
describe('ProductRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock HTTP client
    vi.mock('@/infrastructure/http/fetch-with-token');
  });
  
  describe('getById', () => {
    it('should fetch and parse product correctly', async () => {
      // Arrange
      const mockResponse = {
        data: {
          id: 'p1',
          name: 'Nike Shoes',
          price: 100000,
          stock: 10
        }
      };
      
      mockFetchWithToken.mockResolvedValueOnce(mockResponse);
      
      // Act
      const product = await ProductRepository.getById('p1');
      
      // Assert
      expect(product.id).toBe('p1');
      expect(product.name).toBe('Nike Shoes');
      expect(mockFetchWithToken).toHaveBeenCalledWith('/products/p1');
    });
    
    it('should throw NotFoundError when product not found', async () => {
      // Arrange
      mockFetchWithToken.mockRejectedValueOnce(
        new HttpError('Not Found', 404)
      );
      
      // Act & Assert
      expect(() => ProductRepository.getById('invalid'))
        .rejects
        .toThrow(NotFoundError);
    });
    
    it('should validate response with Zod schema', async () => {
      // Arrange
      const invalidResponse = {
        data: {
          id: 'p1',
          // MISSING: name, price, stock
        }
      };
      mockFetchWithToken.mockResolvedValueOnce(invalidResponse);
      
      // Act & Assert
      expect(() => ProductRepository.getById('p1'))
        .rejects
        .toThrow(ValidationError);
    });
  });
  
  describe('searchAndFilter', () => {
    it('should build correct API params', async () => {
      // Arrange
      const params = {
        keyword: 'nike',
        page: 1,
        size: 20,
        sortBy: 'price',
        sortDirection: 'ascending'
      };
      
      // Act
      await ProductRepository.searchAndFilter(params);
      
      // Assert
      expect(mockFetchWithToken).toHaveBeenCalledWith(
        '/products/search-filter',
        expect.objectContaining({
          query: expect.objectContaining({
            keyword: 'nike',
            page_number: 1,
            page_size: 20
          })
        })
      );
    });
  });
});
```

### Mocking Patterns

```typescript
// ✅ GOOD: Mock external HTTP
vi.mock('@/infrastructure/http/fetch-with-token');
const mockFetch = vi.mocked(fetchWithToken);

// Act
await repository.getProduct('1');

// Assert
expect(mockFetch).toHaveBeenCalledWith('/products/1');

// ✅ GOOD: Mock repository in Use-Case tests
vi.mock('@/infrastructure/repositories/product/product.repository');
const mockRepo = vi.mocked(ProductRepository);

const useCase = new GetProductUseCase(mockRepo);
const result = await useCase.execute('1');

expect(mockRepo.getById).toHaveBeenCalledWith('1');

// ❌ BAD: Mock too much (defeats purpose of integration test)
vi.mock('@/domain');
vi.mock('@/shared');
// Now your test doesn't test reality
```

---

## 🎨 Component Testing

### Ví Dụ: React Component

**File:** `components/features/product/__tests__/ProductCard.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

describe('ProductCard', () => {
  const mockProps = {
    product: {
      id: 'p1',
      name: 'Nike Shoes',
      price: 100000,
      rating: 4.5
    },
    onSelect: vi.fn()
  };
  
  it('should render product info', () => {
    // Arrange
    render(<ProductCard {...mockProps} />);
    
    // Assert
    expect(screen.getByText('Nike Shoes')).toBeInTheDocument();
    expect(screen.getByText('100.000đ')).toBeInTheDocument();
  });
  
  it('should call onSelect when clicked', () => {
    // Arrange
    render(<ProductCard {...mockProps} />);
    
    // Act
    fireEvent.click(screen.getByRole('button', { name: /details/i }));
    
    // Assert
    expect(mockProps.onSelect).toHaveBeenCalledWith('p1');
  });
  
  it('should show loading state', () => {
    // Arrange
    const loadingProps = { ...mockProps, isLoading: true };
    
    // Act
    render(<ProductCard {...loadingProps} />);
    
    // Assert
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useProductList } from '@/presentation/hooks/use-product';

describe('useProductList', () => {
  it('should fetch products on mount', async () => {
    // Arrange
    // (mock useQuery)
    vi.mock('@tanstack/react-query');
    
    // Act
    const { result } = renderHook(() => useProductList());
    
    // Assert
    expect(result.current.isLoading).toBe(true);
    
    // Wait for data
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toBeDefined();
  });
  
  it('should handle errors', async () => {
    // Arrange
    mockUseQuery.mockReturnValue({
      data: null,
      error: new Error('Network error'),
      isLoading: false
    });
    
    // Act
    const { result } = renderHook(() => useProductList());
    
    // Assert
    expect(result.current.error?.message).toBe('Network error');
  });
});
```

---

## 🧬 Snapshot Testing (Use Sparingly)

```typescript
// ⚠️ USE ONLY FOR UI that changes rarely
it('should render ProductCard with correct structure', () => {
  const { container } = render(<ProductCard {...props} />);
  expect(container.firstChild).toMatchSnapshot();
});

// ✅ GOOD: Check specific outputs instead
it('should render product name', () => {
  render(<ProductCard {...props} />);
  expect(screen.getByText('Product Name')).toBeInTheDocument();
});
```

---

## 🧪 Fixture & Factory Pattern

```typescript
// ✅ GOOD: Factory for test data
export function createProductDto(overrides = {}) {
  return {
    id: 'p1',
    name: 'Test Product',
    price: 100000,
    stock: 10,
    ...overrides
  };
}

describe('ProductRepository', () => {
  it('should parse product response', async () => {
    const dto = createProductDto({ name: 'Custom Product' });
    mockFetch.mockResolvedValueOnce({ data: dto });
    
    const result = await ProductRepository.getById('p1');
    expect(result.name).toBe('Custom Product');
  });
  
  it('should accept minimal response', async () => {
    const dto = createProductDto({ name: 'Minimal', price: 50000 });
    mockFetch.mockResolvedValueOnce({ data: dto });
    
    const result = await ProductRepository.getById('p1');
    expect(result.price).toBe(50000);
  });
});
```

---

## 📊 Test Coverage Commands

```bash
# Run tests with coverage report
pnpm test -- --coverage

# Output:
# ├─ domain/ ...................... 95%
# ├─ application/ ................. 88%
# ├─ infrastructure/ .............. 82%
# ├─ presentation/ ................ 85%
# ├─ shared/ ...................... 90%
# └─ components/ .................. 75%

# Generate HTML coverage report
pnpm test -- --coverage --reporter=html

# View: coverage/index.html
```

---

## 🔄 Testing Best Practices

### Arrange-Act-Assert Pattern

```typescript
it('should add product to cart', async () => {
  // ✅ ARRANGE: Set up test data & mocks
  const cartBefore = { items: [] };
  const product = createProductDto();
  mockCartStore.setState(cartBefore);
  
  // ✅ ACT: Perform the action
  cartStore.addItem(product);
  
  // ✅ ASSERT: Verify results
  const cartAfter = cartStore.getState();
  expect(cartAfter.items).toHaveLength(1);
  expect(cartAfter.items[0].id).toBe(product.id);
});
```

### Avoid Test Interdependence

```typescript
// ❌ BAD: Test 2 depends on Test 1
it('test 1: add item', () => {
  cart.addItem(product);
  // shared state modified
});

it('test 2: remove item', () => {
  cart.removeItem(); // Assumes item is there from test 1
});

// ✅ GOOD: Each test is isolated
beforeEach(() => {
  // Reset state before each test
  vi.clearAllMocks();
  cartStore.setState(INITIAL_STATE);
});

it('test 1: add item', () => {
  cart.addItem(product);
  expect(cart.items).toHaveLength(1);
});

it('test 2: remove item', () => {
  // Starts fresh
  cart.addItem(product);
  cart.removeItem();
  expect(cart.items).toHaveLength(0);
});
```

---

## 🚀 Continuous Testing

```bash
# Watch mode (re-run on file change)
pnpm test

# Single run
pnpm test -- --run

# Specific file
pnpm test -- product.test.ts

# Specific test by name
pnpm test -- -t "should add product to cart"

# Debug mode
pnpm test -- --inspect-brk
```

---

## 📋 Testing Checklist

- [ ] Unit tests for domain entities
- [ ] Integration tests for repositories
- [ ] Component tests for UI
- [ ] Error cases covered
- [ ] Edge cases tested
- [ ] Mocks isolated properly
- [ ] Tests run in isolation
- [ ] >80% coverage
- [ ] Meaningful test names
- [ ] No skipped tests (`.skip`, `.only`)

---

**Last Updated:** March 5, 2026

