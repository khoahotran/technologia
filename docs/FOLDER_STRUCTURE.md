# Chi Tiết Cấu Trúc Thư Mục (Folder Structure Guide)

**Mục đích:** Giải thích chi tiết từng thư mục, file, và lý do tại sao tổ chức theo cách này.

---

## 🗂️ Sơ Đồ Toàn Bộ Project

```
frontend-architecture/
│
├── 📁 app/                          # 🔴 Next.js App Router (Framework)
│   ├── 📁 api/
│   │   ├── 📁 auth/
│   │   │   └── login/
│   │   │       └── route.ts         # 🔵 Proxy: POST /api/auth/login
│   │   ├── 📁 users/
│   │   │   └── profile/
│   │   │       └── me/
│   │   │           └── route.ts     # Proxy: GET /api/users/profile/me
│   │   ├── 📁 products/
│   │   ├── 📁 carts/
│   │   └── 📁 cart-items/
│   │
│   ├── 📁 (auth)/                   # Auth route group
│   │   ├── layout.tsx               # Auth layout (login, register pages)
│   │   ├── 📁 login/
│   │   │   ├── page.tsx             # → /login (Server)
│   │   │   └── LoginClient.tsx      # ← /login (Client)
│   │   └── 📁 register/
│   │
│   ├── 📁 (shop)/                   # Shop route group
│   │   ├── page.tsx                 # 🏠 Home page
│   │   ├── 📁 products/
│   │   │   ├── page.tsx             # Products list
│   │   │   └── 📁 [id]/
│   │   │       ├── page.tsx         # Product detail page
│   │   │       └── ProductDetailClient.tsx
│   │   ├── 📁 cart/
│   │   ├── 📁 checkout/
│   │   ├── 📁 orders/
│   │   └── 📁 profile/
│   │
│   ├── layout.tsx                   # Root layout
│   ├── error.tsx                    # Error boundary
│   └── loading.tsx                  # Loading skeleton
│
├── 📁 domain/                       # 🟢 Business Rules (Framework-agnostic)
│   ├── 📁 admin/
│   │   ├── dto/                     # Admin DTOs
│   │   ├── admin.entity.ts          # Admin entity
│   │   └── admin.repository.ts      # IAdminRepository interface
│   ├── 📁 auth/
│   │   ├── dto/                     # Auth request/response DTOs
│   │   ├── auth.entity.ts           # Auth entity
│   │   └── auth.repository.ts       # IAuthRepository interface
│   ├── 📁 cart/
│   │   ├── dto/
│   │   ├── cart.entity.ts
│   │   └── cart.repository.ts       # ICartRepository interface
│   ├── 📁 product/
│   ├── 📁 user/
│   ├── 📁 entities/
│   │   └── base.entity.ts           # Base entity class
│   ├── 📁 errors/
│   │   ├── app.error.ts             # Base AppError
│   │   ├── auth.error.ts            # AuthenticationError, etc
│   │   └── validation.error.ts      # ValidationError
│   ├── 📁 value-objects/
│   │   ├── money.ts                 # Money value object
│   │   └── address.ts               # Address value object
│   └── index.ts                     # Barrel export
│
├── 📁 application/                  # 🟡 Use-Cases Business Logic
│   ├── 📁 use-cases/
│   │   ├── 📁 auth/
│   │   │   ├── login.use-case.ts    # Login workflow
│   │   │   ├── register.use-case.ts
│   │   │   ├── refresh-token.use-case.ts
│   │   │   └── logout.use-case.ts
│   │   ├── 📁 product/
│   │   │   ├── search-products.use-case.ts
│   │   │   ├── get-product-detail.use-case.ts
│   │   │   └── filter-products.use-case.ts
│   │   ├── 📁 cart/
│   │   ├── 📁 checkout/
│   │   └── index.ts
│   │
│   ├── 📁 dto/                      # Data Transfer Objects
│   │   ├── auth.dto.ts
│   │   ├── product.dto.ts
│   │   └── cart.dto.ts
│   │
│   ├── 📁 mappers/
│   │   ├── auth.mapper.ts           # Entity ↔ DTO mapping
│   │   ├── product.mapper.ts
│   │   └── cart.mapper.ts
│   │
│   ├── 📁 query/                    # Query specifications
│   │   ├── 📁 handlers/
│   │   │   └── paginated.handler.ts # Pagination query handler
│   │   └── product-search.spec.ts   # Product search spec
│   │
│   └── index.ts
│
├── 📁 infrastructure/               # 🔴 Technical Implementation
│   ├── 📁 http/
│   │   ├── client.ts                # Axios instance + interceptors
│   │   ├── fetch-with-token.ts      # Unified HTTP client + token refresh
│   │   ├── request-adapter.ts       # Frontend → Backend request mapping
│   │   ├── response-adapter.ts      # Backend → Frontend response mapping
│   │   └── api-error-mapper.ts      # HTTP error → Domain error mapping
│   │
│   ├── 📁 repositories/
│   │   ├── 📁 auth/
│   │   │   ├── auth.repository.ts   # ← Implements IAuthRepository
│   │   │   └── __tests__/
│   │   ├── 📁 product/
│   │   │   ├── product.repository.ts
│   │   │   └── __tests__/
│   │   ├── 📁 cart/
│   │   │   ├── cart.repository.ts
│   │   │   └── __tests__/
│   │   ├── 📁 user/
│   │   ├── base.repository.ts       # Base repository
│   │   └── __tests__/
│   │
│   ├── 📁 persistence/
│   │   ├── storage.ts               # Abstract storage (cookie/localStorage)
│   │   ├── cache.ts                 # Caching layer
│   │   └── __tests__/
│   │
│   ├── 📁 state/                    # Zustand stores (global client state)
│   │   ├── auth.store.ts            # Auth state (user, token, isLoggedIn)
│   │   ├── cart.store.ts            # Cart state (items, total, etc)
│   │   ├── ui.store.ts              # UI state (sidebar, theme, etc)
│   │   └── __tests__/
│   │
│   ├── 📁 providers/
│   │   ├── auth.provider.tsx        # AuthContext provider
│   │   ├── query.provider.tsx       # TanStack Query provider
│   │   └── index.tsx
│   │
│   └── index.ts
│
├── 📁 presentation/                 # 🟢 Presentation Logic (Hooks)
│   ├── 📁 hooks/
│   │   ├── 📁 queries/
│   │   │   ├── use-products.ts      # useQuery hook
│   │   │   ├── use-product-detail.ts
│   │   │   └── use-user-profile.ts
│   │   │
│   │   ├── 📁 mutations/
│   │   │   ├── use-login.ts         # useMutation hook
│   │   │   ├── use-add-to-cart.ts
│   │   │   └── use-checkout.ts
│   │   │
│   │   ├── use-auth.ts              # Context hook (useAuth)
│   │   ├── use-api.hook.ts          # Generic API hook
│   │   ├── use-pagination.ts        # Pagination hook
│   │   └── __tests__/
│   │
│   └── index.ts
│
├── 📁 components/                   # 🔵 React Components
│   ├── 📁 features/                 # Feature-specific components
│   │   ├── Banner.tsx               # Home banner
│   │   ├── Featured Products.tsx
│   │   ├── 📁 product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   └── ProductSearch.tsx
│   │   ├── 📁 cart/
│   │   │   ├── CartSummary.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── CheckoutForm.tsx
│   │   ├── 📁 auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   └── index.ts
│   │
│   ├── 📁 shared/                   # Reusable across features
│   │   ├── Header.tsx               # Site header
│   │   ├── Navbar.tsx               # Navigation
│   │   ├── Footer.tsx               # Site footer
│   │   ├── loading.tsx              # Loading skeleton
│   │   ├── theme-toggle.tsx         # Dark/light mode toggle
│   │   └── index.ts
│   │
│   ├── 📁 ui/                       # Primitive UI (shadcn/ui)
│   │   ├── button.tsx               # <Button />
│   │   ├── card.tsx                 # <Card />
│   │   ├── input.tsx                # <Input />
│   │   ├── dialog.tsx               # <Dialog />
│   │   ├── pagination.tsx           # <Pagination />
│   │   ├── alert.tsx                # <Alert />
│   │   ├── badge.tsx                # <Badge />
│   │   ├── avatar.tsx               # <Avatar />
│   │   ├── breadcrumb.tsx           # <Breadcrumb />
│   │   ├── carousel.tsx             # <Carousel />
│   │   ├── checkbox.tsx
│   │   ├── label.tsx
│   │   ├── tabs.tsx
│   │   ├── __tests__/
│   │   └── index.ts
│   │
│   └── index.ts
│
├── 📁 shared/                       # 🟡 Shared Utilities (UI-agnostic)
│   ├── 📁 constants/
│   │   ├── api.constants.ts         # API paths, URLs
│   │   ├── business.constants.ts    # Tax, shipping rates, etc
│   │   ├── ui.constants.ts          # UI constants (sizes, etc)
│   │   ├── query.constants.ts       # TanStack Query config
│   │   └── index.ts
│   │
│   ├── 📁 types/
│   │   ├── common.ts                # Common types
│   │   ├── api.ts                   # API-related types
│   │   ├── form.ts                  # Form types
│   │   └── index.ts
│   │
│   ├── 📁 utils/
│   │   ├── result.ts                # Go-style error handling: [data, err]
│   │   ├── format.ts                # formatCurrency, formatDate, etc
│   │   ├── validate.ts              # Validation utilities
│   │   ├── string.ts                # String manipulations
│   │   ├── math.ts                  # Math helpers
│   │   ├── __tests__/
│   │   └── index.ts
│   │
│   ├── 📁 validators/               # Zod schemas
│   │   ├── api-schemas.ts           # DTOs validation (Zod)
│   │   ├── form-schemas.ts          # Form validation
│   │   ├── entity-schemas.ts        # Domain entity validation
│   │   └── index.ts
│   │
│   ├── 📁 hooks/
│   │   ├── use-local-storage.ts     # Generic localStorage hook
│   │   ├── use-debounce.ts          # Debounce hook
│   │   ├── use-prev.ts              # Previous value hook
│   │   └── __tests__/
│   │
│   ├── 📁 providers/
│   │   ├── auth.provider.tsx        # Auth context provider
│   │   ├── theme.provider.tsx       # Theme provider
│   │   └── index.tsx
│   │
│   └── 📁 request/
│       ├── api-client.ts            # Axios instance config
│       └── interceptors.ts          # HTTP interceptors
│
├── 📁 locales/                      # 📝 i18n (Multi-language)
│   ├── en.json                      # English translations
│   ├── vi.json                      # Vietnamese translations
│   ├── locale.ts                    # i18n configuration
│   └── languages.interface.ts       # Language types
│
├── 📁 public/                       # 📦 Static assets
│   ├── globals.css                  # Global styles + Tailwind
│   ├── favicon.ico
│   ├── 📁 images/
│   ├── 📁 icons/
│   └── 📁 fonts/
│
├── 📁 lib/                          # 📚 Standalone utilities
│   ├── api-handler.ts               # HTTP response handling
│   ├── api-proxy.ts                 # API proxy middleware
│   ├── api-route.ts                 # API route helpers
│   ├── checkout-flow.ts             # Checkout logic
│   ├── constants.ts                 # Global constants
│   ├── fetch-auth.ts                # Auth fetching
│   ├── handle-response.ts           # Response handler
│   ├── logger.ts                    # Logging utility
│   ├── mock-data.ts                 # Mock data for testing
│   ├── result.ts                    # Result type for error handling
│   ├── store.ts                     # Store configuration
│   ├── utils.ts                     # Misc utilities
│   ├── __tests__/
│   └── index.ts
│
├── 📁 docs/                         # 📖 Documentation
│   ├── README.md                    # ← Main docs entry point
│   ├── GETTING_STARTED.md           # Quick start
│   ├── PROJECT_OVERVIEW.md          # Project overview
│   ├── PROJECT_WALKTHROUGH.md       # Walkthrough
│   ├── ARCHITECTURE.md              # Architecture details
│   ├── FOLDER_STRUCTURE.md          # ← This file
│   ├── DATA_FLOW_GUIDE.md           # Data flow visualization
│   ├── LAYER_DOMAIN.md
│   ├── LAYER_APPLICATION.md
│   ├── LAYER_INFRASTRUCTURE.md
│   ├── LAYER_PRESENTATION.md
│   ├── LAYER_COMPONENTS.md
│   ├── API_ROUTES.md
│   ├── TESTING_GUIDE.md
│   ├── BEST_PRACTICES.md
│   └── TROUBLESHOOTING.md
│
├── 📄 .env.example                  # Environment variables template
├── 📄 .env.local                    # ← Local environment (git ignored)
├── 📄 .eslintrc.json                # ESLint configuration
├── 📄 .gitignore
├── 📄 eslint.config.mjs             # New ESLint config (flat)
├── 📄 next.config.mjs               # Next.js configuration
├── 📄 next-env.d.ts                 # Next.js types
├── 📄 package.json                  # Dependencies & scripts
├── 📄 pnpm-lock.yaml                # Locked versions
├── 📄 pnpm-workspace.yaml           # Workspace config
├── 📄 postcss.config.mjs            # PostCSS config (Tailwind)
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 vitest.config.ts              # Vitest configuration
├── 📄 vitest.setup.ts               # Vitest setup
├── 📄 components.json               # shadcn/ui configuration
├── 📄 README.md                     # Project README
└── 📄 proxy.ts                      # Next.js middleware (auth proxy)
```

---

## 🎯 Giải Thích Từng Phần

### 🔴 app/ - Next.js Routes
**Chỉ chứa:**
- Pages (*.tsx)
- Layouts (layout.tsx)
- API proxy routes (api/**/route.ts)
- Loading/Error boundaries

**Không chứa:**
- ❌ Business logic
- ❌ State management
- ❌ HTTP calls (except proxy)

### 🟢 domain/ - Business Rules
**Chỉ chứa:**
- Entities (business models)
- Repository interfaces
- Custom errors
- Value objects

**Đặc điểm:**
- ✅ Framework-agnostic (không biết React, Next.js)
- ✅ Pure TypeScript
- ✅ Testable dễ nhất
- ✅ "Source of Truth" cho business logic

### 🟡 application/ - Use-Cases
**Chỉ chứa:**
- Use-case implementations (business workflows)
- DTOs (data transfer objects)
- Mappers (entity ↔ DTO)
- Query specifications

**Đặc điểm:**
- Điều phối giữa domain & infrastructure
- Chứa business logic flow
- Không biết React, Next.js

### 🔴 infrastructure/ - Technical Implementation
**Chỉ chứa:**
- Concrete repository implementations
- HTTP client setup
- Storage abstraction
- Global state (Zustand stores)
- Error mapping

**Đặc điểm:**
- Implements domain interfaces
- Giao tiếp với backend
- Quản lý caching, persistence

### 🟢 presentation/ - UI Logic
**Chỉ chứa:**
- Custom hooks (queries, mutations)
- TanStack Query wrappers
- Context hooks

**Không chứa:**
- ❌ Components (ở /components)
- ❌ Business logic (ở /application)

### 🔵 components/ - React Components
**Chỉ chứa:**
- .tsx files
- Styled components
- No business logic

**Cấu trúc:**
- `features/` - Tính năng cụ thể
- `shared/` - Tái sử dụng toàn app
- `ui/` - Primitive components (shadcn/ui)

### 🟡 shared/ - Utilities
**Chỉ chứa:**
- Constants
- Types
- Pure functions (formatters, validators)
- Generic hooks
- Zod schemas

**Đặc điểm:**
- Dùng được ở mọi lớp
- Không phụ thuộc React/Next.js
- Testable dễ

---

## 📊 Mối Quan Hệ Giữa Các Folder

```
Presentation (Hooks) ──┐
                       │ import
Components ────────────┼──────→ Application Layer
   │                   │
   └──────┬────────────┤
           │            │
        Local State  Use-Cases
           │            │
           └────────────┤──────→ Infrastructure Layer
                        │
                        ├──────→ Domain Layer
                        │
           ┌────────────┴──────
           ↓
       Shared Utilities
```

### Quy tắc Dependency
```
✅ ALLOWED:                ❌ NOT ALLOWED:
presentation → application  application → presentation
application → infrastructure infrastructure → application
infrastructure → domain    domain → anything else
components → shared        components → domain/application
```

---

## 🔍 Files Quan Trọng Nhất

### 💎 "Kim chỉ nam" - Top 5 Files to Understand

1. **`domain/**/repository.ts`**
   - Định nghĩa interface quái gì data cần (get, save, delete)
   - Không biết implementation

2. **`infrastructure/repositories/**/repository.ts`**
   - Implement interface từ domain
   - Gọi HTTP client

3. **`infrastructure/http/fetch-with-token.ts`**
   - Cách project giao tiếp backend
   - Token refresh logic

4. **`application/use-cases/**/*.ts`**
   - Luồng business logic từ A → Z
   - Nơi business rule sống

5. **`presentation/hooks/*.ts`**
   - Nơi component lấy data
   - TanStack Query wrapper

---

## 📝 File Naming Conventions

| Loại | Pattern | Ví dụ |
|------|---------|--------|
| Entity | `*.entity.ts` | `product.entity.ts` |
| Repository Interface | `*.repository.ts` | `product.repository.ts` |
| Repository Impl | `*.repository.ts` | `product.repository.ts` (in infrastructure) |
| Use-Case | `*.use-case.ts` | `login.use-case.ts` |
| Hook (Query) | `use*.ts` | `useProductList.ts` |
| Hook (Mutation) | `use*.ts` | `useAddToCart.ts` |
| Component | `*.tsx` | `ProductCard.tsx` |
| Schema | `*.schema.ts` | `product.schema.ts` |
| Store (Zustand) | `*.store.ts` | `auth.store.ts` |
| Provider | `*.provider.tsx` | `auth.provider.tsx` |
| Test | `*.test.ts` | `product.entity.test.ts` |

---

## 🎯 Bắt Đầu Khám Phá

**Muốn hiểu sâu từng layer?**
- [LAYER_DOMAIN.md](./LAYER_DOMAIN.md)
- [LAYER_APPLICATION.md](./LAYER_APPLICATION.md)
- [LAYER_INFRASTRUCTURE.md](./LAYER_INFRASTRUCTURE.md)
- [LAYER_PRESENTATION.md](./LAYER_PRESENTATION.md)
- [LAYER_COMPONENTS.md](./LAYER_COMPONENTS.md)

---

**Last Updated:** March 5, 2026

