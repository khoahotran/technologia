# Clean Architecture + DDD Refactoring Guide

## Overview

This document defines the refactored frontend architecture following **Clean Architecture** and **Domain-Driven Design** (DDD) principles, with strict adherence to **SOLID**, **DRY**, **KISS** principles and pragmatic design patterns.

---

## Project Structure

```
frontend-architecture/
├── domain/                          # Domain Layer (Business Rules)
│   ├── entities/                    # Domain entities with validation
│   ├── value-objects/               # Immutable value objects
│   ├── repositories/                # Repository interfaces
│   ├── errors/                      # Domain-specific errors
│   └── specifications/              # Domain specs (filtering logic)
│
├── application/                     # Application Layer (Use-Cases)
│   ├── use-cases/                   # Business workflows (input → output)
│   ├── dto/                         # Data Transfer Objects
│   ├── mappers/                     # Entity ↔ DTO mapping
│   ├── query/                       # Query specifications
│   │   └── handlers/                # Paginated query handlers
│   └── commands/                    # Command specifications
│
├── infrastructure/                  # Infrastructure Layer
│   ├── http/                        # HTTP client, request/response handlers
│   │   ├── client.ts                # Axios instance with interceptors
│   │   ├── fetch-with-token.ts      # Unified token handling
│   │   ├── request-adapter.ts       # Frontend → Backend request mapping
│   │   ├── response-adapter.ts      # Backend → Frontend response mapping
│   │   └── api-error-mapper.ts      # HTTP error → Domain error mapping
│   ├── repositories/                # Concrete repository implementations
│   ├── persistence/                 # Storage, caching layer
│   ├── state/                       # Zustand stores (global state)
│   └── providers/                   # React context providers
│
├── presentation/                    # Presentation Layer (UI)
│   ├── hooks/                       # Custom hooks (TanStack Query, state)
│   │   ├── queries/                 # useQuery hooks by domain
│   │   ├── mutations/               # useMutation hooks by domain
│   │   └── invalidation/            # Cache invalidation logic
│   └── pages/                       # Page components
│
├── shared/                          # Shared Utilities
│   ├── constants/                   # App constants, URLs, config
│   ├── types/                       # Shared types & interfaces
│   ├── utils/                       # Pure utility functions
│   ├── validators/                  # Zod schemas & validation
│   └── hooks/                       # Generic presentation hooks
│
├── components/                      # UI Components
│   ├── features/                    # Feature-specific components
│   ├── shared/                      # Reusable UI components
│   └── ui/                          # Primitive UI components (shadcn)
│
└── tests/                           # Test configurations & utilities
    ├── utils/                       # Test helpers
    └── mocks/                       # Mock data & MSW setup
```

---

## Architectural Principles & Patterns

### 1. **Dependency Injection**
- **Application Layer** is independent of **Infrastructure**
- Repositories injected via interfaces, not concrete implementations
- HTTP client abstracted behind repository interface

### 2. **SOLID Principles**

#### S - Single Responsibility
- Each file/class handles one concern
- Repositories handle data access only
- Hooks handle UI state logic only
- Use-cases contain business logic only

#### O - Open/Closed
- Domain entities extensible without modification
- Repository behavior customizable via query specs
- Error handling extensible without changing core logic

#### L - Liskov Substitution
- All repository implementations satisfy interface contract
- Error classes can be substituted safely
- Query/mutation hooks interchangeable

#### I - Interface Segregation
- Focused interfaces (`IProductRepository`, `IAuthRepository`)
- Hooks export only necessary methods
- Components accept only required props

#### D - Dependency Inversion
- High-level modules depend on abstractions
- HTTP client abstracted (`httpClient` interface)
- Storage abstracted (cookie vs localStorage vs memory)

### 3. **DDD Tactical Patterns**

#### Entities
- Encapsulate domain knowledge
- Validate data in constructors
- Never expose mutability

```typescript
// Good: Entity protects invariants
export class Product extends Entity<IProduct> {
  constructor(props: IProduct) {
    super(props);
    if (props.price < 0) throw new InvalidPrice(...);
  }
}
```

#### Value Objects
- Immutable by design
- Compared by value, not reference
- Used for typed primitives (Money, Address, etc.)

#### Aggregates
- Composed of entities + value objects
- Single aggregate root entry point
- Consistency boundary

#### Repository Pattern
- Abstract data source (API, cache, database)
- Speak domain language, not SQL/HTTP
- Return domain entities, not DTOs

### 4. **Design Patterns (Pragmatically Applied)**

#### Factory Pattern
- **When**: Complex entity creation → use factories
- **Location**: `application/factories/` or in repositories
- **Avoid**: Over-using; don't create factory for simple models

#### Adapter Pattern
- **When**: Transform backend API contracts to domain models
- **Location**: `infrastructure/http/adapters/`
- **Example**: `response-adapter.ts` maps API fields to entity fields

#### Repository Pattern  
- **When**: Data access needs abstraction
- **Location**: `infrastructure/repositories/`
- **Usage**: Injected into hooks, accessed from use-cases

#### Query Specification Pattern
- **When**: Complex filtering/pagination
- **Location**: `application/query/`
- **Example**: `ProductSearchSpec` defines semantic search params

#### Facade Pattern
- **When**: Multiple repos need coordination
- **Location**: `application/use-cases/`
- **Example**: Combined cart + product + shipping operations

#### Builder Pattern
- **When**: Complex object construction (optional)
- **Location**: Value objects, DTOs
- **Example**: QueryBuilder for URL search params

---

## Data Flow

### Command (Mutation) Flow
```
UI Component
    ↓ (calls mutation hook)
Mutation Hook (useMutation from @tanstack/react-query)
    ↓ (calls)
Use-Case (pure function or class)
    ↓ (calls)
Repository.save / Repository.delete (interface)
    ↓ (implements)
Concrete Repository (ProductRepository)
    ↓ (calls)
fetchWithToken (unified HTTP client)
    ↓ (makes request)
API Handler (next-auth-aware request)
    ↓ (proxies to)
Backend Service
    ↓ (returns)
Response Adapter (maps to domain model)
    ↓
Error Mapper (if error, converts to domain error)
    ↓
Returns Result<Entity> | throws AppError
    ↓ (invalidate & refetch)
Query Cache
    ↓ (re-renders)
Component
```

### Query (Fetch) Flow
```
Component
    ↓ (calls)
Query Hook (useProductList)
    ↓ (wrapped in useQuery)
Repository.searchAndFilter()
    ↓
HTTP Client with interceptors
    ↓
Backend API
    ↓
Response Adapter validates schema with Zod
    ↓
Returns typed data or throws AppError
    ↓ (via TanStack Query)
Cache + UI state
    ↓ (renders with loading/error/success)
Component displays data
```

---

## Key Principles by Layer

### Domain Layer
✅ **MUST**
- Contain only business rules
- Be framework-agnostic
- Validate invariants
- Use Zod for entity schema validation
- Export interfaces for repositories

❌ **MUST NOT**
- Know about React
- Know about Next.js or API library
- Make HTTP requests
- Use async/await (prefer Result pattern or exceptions)
- Depend on infrastructure

### Application Layer
✅ **MUST**
- Contain use-case logic
- Depend on domain interfaces
- Map domain entities ↔ DTOs
- Define query/command specifications
- Be testable without mocking HTTP

❌ **MUST NOT**
- Know about React
- Make HTTP calls directly (use repository)
- Know about routing or pages
- Violate Single Responsibility

### Infrastructure Layer
✅ **MUST**
- Implement domain repository interfaces
- Handle HTTP client setup (auth, retries, timeouts)
- Map backend responses → domain entities
- Map application errors → domain errors
- Manage storage & caching

❌ **MUST NOT**
- Expose HTTP client directly to components
- Return raw API responses (must validate with Zod)
- Skip error mapping
- Know about page structure

### Presentation Layer (Hooks)
✅ **MUST**
- Wrap TanStack Query with domain language
- Invalidate cache correctly on mutations
- Handle loading/error/success states
- Be small and focused
- Type-safe with repository interfaces

❌ **MUST NOT**
- Contain business logic
- Make HTTP calls directly
- Depend on component props for core logic
- Skip error boundaries

### Shared Layer
✅ **MUST**
- Be UI-agnostic
- Export only pure functions
- Be well-tested
- Be well-documented

❌ **MUST NOT**
- Depend on domain or infrastructure
- Violate DRY principle
- Export default values for config

---

## Error Handling Strategy

### Error Hierarchy
```
AppError (base)
├── NetworkError (no connection)
├── TimeoutError (request timeout)
├── HttpError (HTTP status errors)
│   ├── BadRequestError (400)
│   ├── AuthenticationError (401)
│   ├── AuthorizationError (403)
│   ├── NotFoundError (404)
│   └── ServerError (5xx)
├── ValidationError (Zod schema failure)
└── DomainError (business rule violation)
```

### Error Handling Pattern
```typescript
// Repository returns typed errors
try {
  const product = await productRepo.getById(id);
  // use product
} catch (error) {
  if (error instanceof AuthenticationError) {
    // redirect to login
  } else if (error instanceof NotFoundError) {
    // show 404 page
  } else if (error instanceof NetworkError) {
    // show retry prompt
  } else {
    // generic error handling
  }
}
```

---

## State Management Strategy

### TanStack Query (Server State)
- ✅ Fetch products, orders, user data
- ✅ Handle caching, refetch, invalidation
- ✅ Manage pagination, sorting, filtering
- ✅ Automatic retry on failure

### Zustand (Client State - Minimal)
```typescript
// ✅ USE ZUSTAND FOR:
- Authentication state (user, isLoggedIn)
- Sidebar collapsed state
- Theme preference (dark/light)
- Shopping cart items (local, before checkout)

// ❌ DON'T USE ZUSTAND FOR:
- Product list (use TanStack Query)
- Order history (use TanStack Query)
- Cached data (use TanStack Query)
- Any server-derived state
```

### Rule: Global State = Server State + UI State
```typescript
// Global state should be ≤ 5% of total state
// 95% should be server state (TanStack Query)
```

---

## API Contract Management

### Backend API Response Structure
All backend responses must follow standard structure:
```typescript
// ✅ LIST Response
{
  status: 200,
  message: "OK",
  data: { 
    items: Product[],
    page_number: 0,
    page_size: 10,
    count_items: 100,
    count_pages: 10
  }
}

// ✅ SINGLE Response
{
  status: 200,
  message: "OK",
  data: { id, name, ... }
}

// ❌ ERROR Response
{
  status: 400,
  message: "Invalid request",
  errors: { field: "error message" }
}
```

### Response Validation
All responses validated with Zod schemas:
```typescript
const ProductResponseSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  price: z.number().positive(),
  // ... other fields
});

const ListResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    items: z.array(ProductResponseSchema),
    page_number: z.number(),
    page_size: z.number(),
    count_items: z.number(),
    count_pages: z.number(),
  }),
});
```

---

## Testing Strategy

### Unit Tests (Domain Layer)
- Test entities, value objects, specifications
- No mocks, pure functions
- Test invariant validation

```typescript
describe('Product Entity', () => {
  it('should throw InvalidPrice if price < 0', () => {
    expect(() => new Product({ price: -10 }))
      .toThrow(InvalidPrice);
  });
});
```

### Integration Tests (Application Layer)
- Test use-cases with mock repositories
- Verify business logic
- Test error handling

```typescript
describe('SearchProductsUseCase', () => {
  it('should search products and return results', async () => {
    const mockRepo = {
      searchAndFilter: vi.fn().mockResolvedValue([...])
    };
    const result = await searchProducts(mockRepo, params);
    expect(result).toBeDefined();
  });
});
```

### Component Tests (Presentation Layer)
- Test hooks with MSW (Mock Service Worker)
- Test loading/error/success states
- Test user interactions

```typescript
describe('useProductList', () => {
  it('should display products after loading', async () => {
    const { result } = renderHook(() => useProductList());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
```

---

## Code Organization Rules

### File Naming
```
// Entities: PascalCase + .entity.ts
Product.entity.ts
ProductVariant.entity.ts

// Repositories: camelCase + .repository.ts
product.repository.ts
IProductRepository.ts

// Use-Cases: camelCase + .use-case.ts
search-products.use-case.ts
add-to-cart.use-case.ts

// Hooks: camelCase + .hook.ts or .ts
useProductList.ts
use-cart.ts

// Schemas/Validators: describeSchema + .schema.ts
product.schema.ts
create-product.schema.ts

// Types/Interfaces: PascalCase + .ts or .types.ts
IProduct.ts
CreateProductRequest.ts
```

### Export Patterns
```typescript
// ✅ Named exports for everything
export { Product }
export { ProductRepository }
export { useProductList }

// ❌ Avoid default exports (harder to refactor)
// ❌ Avoid barrel exports for cross-layer imports
// ✅ Barrel exports OK for same-layer re-exports
```

---

## Dependency Rules

```
Presentation   →   Application   →   Domain
   ↓                   ↓               ↑
 shared         Infrastructure → ↑
   ↑                   ↑
   └─← No backwards dependencies
```

### Concrete Rules
- ❌ Domain depends on nothing
- ✅ Application depends on Domain
- ✅ Infrastructure implements Domain interfaces
- ✅ Presentation uses Application (hooks)
- ✅ Shared can be used by anyone
- ❌ Domain never imports from Application/Infrastructure/Presentation

---

## Performance Optimization

### Caching Strategy
- `staleTime: 5 * 60 * 1000` (5 min) - most lists
- `staleTime: 30 * 1000` (30 sec) - user profile
- `staleTime: 0` - critical data (cart, checkout)

### Pagination Pattern
```typescript
// Prefetch next page on scroll
useEffect(() => {
  if (hasMore) {
    queryClient.prefetchQuery({
      queryKey: productKeys.list({ ...params, page: page + 1 }),
      queryFn: () => productRepo.searchAndFilter({ ...params, page: page + 1 }),
    });
  }
}, [page, hasMore]);
```

### Component Optimization
- Use `React.memo` for expensive components
- Memoize callback deps carefully
- Avoid re-renders with proper key props

---

## Documentation Requirements

### Per Entity/Hook/UseCase:
- JSDoc comment describing purpose
- Input/output types clearly documented
- Error cases documented
- Example usage if complex

Example:
```typescript
/**
 * Search and filter products with pagination
 * 
 * @param params - Search parameters (page, size, keyword, filters)
 * @returns Promise resolving to paginated search results
 * @throws {ValidationError} if params invalid
 * @throws {NetworkError} if network unavailable
 * 
 * @example
 * const results = await productRepo.searchAndFilter({
 *   keyword: 'nike shoes',
 *   page: 0,
 *   size: 10
 * });
 */
export async function searchAndFilter(params: ProductSearchParams) {
  // ...
}
```

---

## Next Steps

1. ✅ Domain layer refactoring (centralize error classes, add value objects)
2. ✅ Infrastructure layer (response adapters, error mappers)
3. ✅ Application layer (use-case contracts, DTOs)
4. ✅ Presentation layer (hook restructuring, cache invalidation)
5. ✅ Repository pattern enforcement
6. ✅ API contract validation with Zod
7. ✅ Testing setup (unit, integration, component)
8. ✅ Documentation and examples

---

**Last Updated**: March 3, 2026
**Architecture Quality**: Production-grade, DDD-aligned, Clean Architecture
**Team Size**: Scalable for 5-50 developers
