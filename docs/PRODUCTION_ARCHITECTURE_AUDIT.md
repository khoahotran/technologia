# Production Architecture Audit

## Audit Summary

### Critical
- Dual auth systems: `shared/providers/auth.provider.tsx`, `infrastructure/state/auth.store.ts`, `presentation/hooks/use-auth.ts`, and page clients previously maintained separate session sources. This causes stale auth state, double token writes, and inconsistent redirects.
- Server state mixed into client state: cart and auth data were split between TanStack Query, React Context, Zustand, and local storage. That breaks cache invalidation and creates race conditions after login, logout, and cart mutations.
- UI-driven business workflows: `app/(auth)/login/LoginClient.tsx`, `app/(shop)/products/[id]/ProductDetailClient.tsx`, `app/(shop)/cart/CartClient.tsx`, and `app/(shop)/shipping/ShippingClient.tsx` contained orchestration logic, retry assumptions, and backend-specific behavior.
- Overlapping HTTP abstractions: `lib/api-route.ts`, `lib/api-handler.ts`, `infrastructure/http/fetch-with-token.ts`, and route handlers all performed partial proxying/auth/error work. This makes contract drift and inconsistent error handling likely.
- Documentation and implementation divergence: docs claimed a production-ready Clean Architecture, but runtime code still used mock product pages, duplicated state paths, and partial layering.

### Medium
- Product listing page still rendered mock data in `app/(shop)/products/ProductsClient.tsx` instead of real query-backed state.
- Cart total calculation used mutation-in-effect patterns, causing avoidable network chatter and imperative server-state handling.
- Repository/provider DI existed only partially; many consumers imported concrete repositories directly.
- Excessive debug logging in auth/http/storage paths risks leaking operational details and adds noise.
- API contract normalization lived in multiple places instead of one adapter/client boundary.

### Minor
- Mixed naming and layering conventions across `app`, `components`, `presentation`, `infrastructure`, and `lib`.
- Some metadata/content strings and comments were inconsistent or outdated.
- Multiple barrel exports and legacy wrappers increased cognitive load.

## Refactor Delivered

A new architecture spine was added under `src/`:

```text
src/
  app/
    providers/
    routing/
  domain/
    entities/
    types/
  application/
    use-cases/
    services/
  infrastructure/
    clients/
  presentation/
    hooks/
  store/
  shared/
    config/
    constants/
```

### Implemented changes
- Centralized API utilities in `src/infrastructure/clients/api-client.ts` with `apiClient()`, `fetchWithToken()`, `requestInterceptor()`, and `errorHandler()`.
- Added a single persisted auth session store in `src/store/auth-session.store.ts`.
- Added auth session service and login/logout use cases in `src/application`.
- Added query-key and routing constants in `src/shared/constants/query-keys.ts` and `src/app/routing/routes.ts`.
- Rewired legacy providers/hooks to the new session/query flow.
- Replaced login page orchestration with application-level auth use cases.
- Replaced cart/shipping price recalculation mutation-effects with query-based server state.
- Moved add-to-cart quantity orchestration into an application use case and reused it from product detail.

## Migration Roadmap
- Move remaining page-level workflows into `src/application/use-cases`.
- Replace direct repository imports in UI hooks with repository contracts/factories.
- Convert the products list page from mock data to query-backed presentation state.
- Consolidate `lib/api-handler.ts` and `lib/api-route.ts` behind one proxy boundary.
- Remove obsolete legacy wrappers once all app pages consume the `src` architecture directly.

## Risk Assessment
- Highest residual risk: some legacy files still exist for compatibility, so the repository is in a transitional state rather than a full physical migration.
- Secondary risk: backend route inconsistencies documented in `backend-provided` still require defensive mapping and should be validated with integration tests.
- Recommended next step: finish migrating product listing and remaining auth/profile flows, then delete the duplicated legacy abstractions.
