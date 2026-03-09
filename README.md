# Frontend Architecture (Pragmatic Refactor)

This frontend is now organized as a lightweight, feature-first codebase.

## Backend Integration

- API base URL: `http://localhost:8080` (Spring Cloud Gateway)
- Frontend must call gateway endpoints only
- Auth verification is header-only:
  - `Authorization: Bearer <access_token>`
- Cookie-based auth flow has been removed from active frontend code

## Current Structure

```text
src/
  api/
  app/
  components/
  config/
  constants/
  features/
  hooks/
  providers/
  store/
  types/
  utils/
```

## State Management

- TanStack Query: server state and caching
- Zustand: client session/UI state only

## Quick Start

```bash
pnpm install
pnpm dev
```

## Validation

```bash
pnpm exec tsc --noEmit
pnpm eslint .
pnpm vitest run
```
