# Frontend Architecture Overview

This document describes the simplified, feature-based architecture implemented in this project.

## Core Philosophy

The architecture is designed to be **Pragmatic, Flat, and Feature-First**. It avoids deep inheritance and complex abstraction layers (like strict Clean Architecture or DDD) in favor of colocation and readability.

## Folder Structure

```text
src/
  api/            # Unified Axios client with interceptors
  app/            # Next.js App Router (Pages, Layouts, Providers)
  components/     # Shared UI components (Atomic design-ish)
    ui/           # Base UI primitives (shadcn/ui)
    shared/       # Common layouts/loaders
    features/     # Larger feature-specific components
  config/         # Environment variables and app-wide config
  constants/      # Query keys, route paths, app constants
  features/       # Business modules (Domain logic)
    [feature]/    # e.g., auth, products, cart
      api.ts      # Feature-specific API calls
      hooks.ts    # Custom hooks (data fetching + logic)
      types.ts    # Feature DTOs and interfaces
      store.ts    # Local state (Zustand) if needed
  hooks/          # Generic reusable hooks (viewport, debounce)
  providers/      # React context providers
  store/          # Global Zustand stores
  types/          # Shared system types and API wrappers
  utils/          # General helpers (formatters, validators)
```

## API Interaction Strategy

### Unified Client (`src/api/client.ts`)

We use a single Axios instance configured to point to the **API Gateway** (`http://localhost:8080`).

- **Authorization**: Injects JWT automatically from the Zustand Auth store.
- **Refresh Token**: Handles `401 Unauthorized` by attempting a single refresh-token flow before clearing session.
- **Error Handling**: Standardized `AppError` class maps HTTP status codes to meaningful frontend messages.

### Feature APIs

Each feature defines its own `api.ts` file. These functions call the unified client and handle any necessary data transformation between backend and frontend models.

## State Management

### Server State (TanStack Query)

- Used for caching, loading states, and data synchronization.
- **Query Keys**: Managed in `src/constants/query-keys.ts` to ensure consistency.

### Client State (Zustand)

- **Global**: Auth session, basic site configuration.
- **Feature-Local**: Complex UI states (e.g., cart optimism, filter state).

## Key Principles

1. **Colocation**: Keep types, hooks, and API calls near the feature logic.
2. **Simplified Layers**: No separate "Repository" or "Adapter" classes unless a specific conversion is extremely complex.
3. **Optimistic UI**: Use TanStack Query mutations for immediate user feedback (e.g., adding to cart).
