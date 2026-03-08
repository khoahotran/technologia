# Frontend Refactor & Audit (2026-03-08)

## Refactored Codebase Structure (Key Modules)

Implemented/updated:
- `src/infrastructure/api/api-client.ts`
- `src/infrastructure/api/schemas.ts`
- `src/domain/models/auth.model.ts`
- `src/domain/models/user.model.ts`
- `src/domain/repositories/auth.repository.ts`
- `src/domain/repositories/user.repository.ts`
- `src/infrastructure/repositories/auth.gateway.repository.ts`
- `src/infrastructure/repositories/user.gateway.repository.ts`
- `src/app/query-client.ts`

## Example Refactored Feature: Authentication Flow

Refactored pipeline:
1. Presentation hook (`src/presentation/hooks/use-auth-session.ts`) triggers mutation.
2. Application use-case (`src/application/use-cases/login.use-case.ts` / `google-login.use-case.ts`) orchestrates auth + profile fetch.
3. Infrastructure repositories call gateway endpoints:
   - `POST /api/auth/login/local`
   - `POST /api/auth/login/google`
   - `GET /api/users/profile/me`
4. All responses are Zod-validated against backend wrapper contracts.
5. Session persistence writes Zustand + token storage via `authSessionService`.

## State Management Optimization

Applied:
- Central `QueryClient` in `src/app/query-client.ts` with:
  - standard staleTime/gcTime
  - retry policy (no retry for 4xx)
- Structured keys added:
  - `productKeys.list(filters)`
  - `productKeys.detail(id)`
  - `cartKeys.detail()`, `cartKeys.price(ids)`
- Optimistic cart updates in `src/presentation/hooks/use-cart-server-state.ts` for:
  - add to cart
  - increase quantity
  - decrease quantity
  - remove item

## Technical Audit Findings

### Critical
- Duplicate architecture trees (`/src` and top-level `/domain|application|infrastructure|presentation`) still coexist and cause mixed imports.
- Cart repository exposes methods not present in backend controller routes (`/cart-items/{id}`, `/cart-items/batch-delete`, `/carts/clear`) and should be removed or backend-aligned.

### API/Gateway
- Runtime product error text mentioned direct product service port (`8082`); updated to gateway (`8080`).
- Existing Next API proxy helpers still include service-oriented naming; runtime base URL currently points to gateway.

### Performance
- Added optimistic cart cache updates to reduce refetch-only UI latency.
- Remaining risk: product list rendering still depends on broad object params; key normalization can be improved for memo stability.

### Code Quality
- Added unit test for auth login use-case orchestration and persistence.
- Remaining gap: no comprehensive tests yet for new API interceptor refresh/error branches.
