# Pragmatic Frontend Refactor (2026-03-09)

## Target Architecture (Flat + Feature-first)

Active runtime paths are now centered on:

```text
src/
  api/            # one HTTP client + interceptors
  app/            # Next App Router pages/layout/providers entry
  components/     # shared UI
  constants/      # query keys, routes, app constants
  features/       # auth, products, cart, checkout, user
  hooks/          # generic reusable hooks
  providers/      # query/theme/lang/auth providers
  store/          # Zustand stores
  types/          # shared DTO / API wrapper types
  utils/          # helpers
```

Each feature keeps local API + hooks + types:

```text
features/auth/
  api.ts
  hooks.ts
  store.ts
  types.ts
```

## What Was Refactored

1. `src/api/client.ts`
- Base URL fixed to API Gateway (`NEXT_PUBLIC_API_GATEWAY_URL`, default `http://localhost:8080`).
- Request interceptor injects JWT from Zustand auth store.
- Response interceptor handles:
  - `401`: one refresh-token retry then logout
  - `403`: forbidden error
  - `5xx`: server error
- FormData-safe request handling for avatar upload.

2. Auth feature (`src/features/auth/*`)
- Uses direct gateway endpoints only (`/api/auth/*`).
- Fixed endpoint typo: `forget-password` (backend source of truth).
- Added critical Zod validation for login/refresh wrappers.
- Logout mutation now gracefully handles missing refresh token.

3. Query integration
- Added centralized query client factory: `src/app/query-client.ts`.
- Query provider uses shared config.
- Query keys use simple factory helpers in `src/constants/query-keys.ts`.

4. Cart feature (`src/features/cart/hooks.ts`)
- Kept logic in one hook file.
- Added readable optimistic updates (+ rollback) for add/increase/decrease/remove.

5. DTO compatibility fixes
- Register payload uses backend field names: `firstName`, `lastName`.

## Backend Source-of-Truth Mapping

All refactored feature APIs call Gateway endpoints only:
- Auth: `/api/auth/*`
- User: `/api/users/*`
- Product: `/api/products/*`, `/api/brands/*`, `/api/categories/*`
- Cart: `/api/carts/*`, `/api/cart-items/*`

No direct calls to `8081/8082/8083` in active feature code paths.

## Trade-offs (Simplicity vs Maintainability)

- Chosen:
  - fewer abstractions
  - direct feature API calls
  - colocated types/hooks per feature
- Kept:
  - one centralized HTTP client
  - TanStack Query for server state
  - Zustand for session/UI state
- Deliberately avoided:
  - strict Clean Architecture layers
  - repository factories/adapters for every endpoint
  - deep dependency injection patterns
