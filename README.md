# Frontend Architecture & Documentation Overview

Welcome to the centralized documentation for the **React Clean Architecture + Domain-Driven Design (DDD)** project.

This project uses a layered architecture approach to keep the UI, application logic, infrastructure, and business rules decoupled, testable, and maintainable. This document aggregates our architectural principles and describes how each folder and layer functions.

## 📁 Directory Structure & Layers overview

```text
frontend-architecture/
├── app/                             # Next.js App Router (pages and layouts)
├── application/                     # Application Layer (Use-Cases)
│   └── use-cases/                   # Business workflows (input → output), mapping Domain ↔ DTOs
├── components/                      # UI Components
│   ├── features/                    # Feature-specific components
│   ├── shared/                      # Reusable UI components
│   └── ui/                          # Primitive UI components (e.g. shadcn)
├── domain/                          # Domain Layer (Business Rules)
│   ├── admin/                       # Admin domain logic
│   ├── cart/                        # Cart domain logic
│   ├── entities/                    # Cross-cutting Domain entities with validation
│   ├── errors/                      # Domain-specific validation & HTTP errors
│   ├── payment-account/             # Payment-related domain rules
│   ├── product/                     # Product/Brand/Category domain rules
│   └── user/                        # Authentication & User Profile rules
├── infrastructure/                  # Infrastructure Layer
│   ├── http/                        # HTTP clients, interceptors, request/response formatters
│   ├── persistence/                 # Storage, local/cookie/session capabilities
│   ├── repositories/                # Concrete implementations of Domain Repository interfaces
│   └── state/                       # Zustand stores for global/client state
├── presentation/                    # Presentation Layer (UI State & Fetching)
│   └── hooks/                       # Custom hooks (TanStack Query, mutations, data fetching)
├── shared/                          # Utility functions and shared assets
│   ├── constants/                   # Global constants and config variables
│   ├── types/                       # Cross-cutting Typescript interfaces/types
│   ├── utils/                       # Reusable utility functions
│   └── validators/                  # Zod validation schemas
└── docs/                            # Deep-dive architecture and API integration documents
```

---

## 🏗 Key Principles by Layer

### 1. Domain Layer (`/domain`)

- **Purpose**: At the very heart of the application, it holds entity schemas, custom App Errors, and business invariants specific to the application requirements (Admin, Cart, Payment, Product, User).
- **Rules**:
  - Must not have dependencies on React, Next.js, or API clients.
  - Can only export pure TS definitions, classes, and Zod schemas (entities, value objects, and error hierarchies).

### 2. Application Layer (`/application`)

- **Purpose**: Connects the UI to the Domain. Mainly composed of Use Cases that map DTOs back and forth and orchestrate requests through Repositories.
- **Rules**:
  - Contains all the business logic workflows (e.g., `AddToCartUseCase`, `LoginUseCase`).
  - Expects Repository interfaces to be injected. Purely functional.

### 3. Infrastructure Layer (`/infrastructure`)

- **Purpose**: Deals with exactly _how_ data is fetched, cached, and stored. Includes implementation of domain repositories and adapters tracking JSON from the API boundaries into strictly typed Domain Entities.
- **Rules**:
  - Maps backend errors directly into Domain Errors.
  - Houses the unified HTTP Client (`fetchWithToken`, `httpClient`) correctly proxying via `next-auth` or proxy functions.
  - Uses Zustand for minimal non-server Global State (like theme, cart UI before fetching, auth token states).

### 4. Presentation Layer (`/presentation`)

- **Purpose**: Defines how the UI interacts with layers underneath. Often encapsulated via React Hooks.
- **Rules**:
  - Wraps fetching logic (via TanStack React Query) providing variables like `isLoading`, `data`.
  - Dispatches calls to Application Use-Cases.
  - Handled invalidation correctly upon mutations.

---

## 🛠 Project Data Flow

```text
UI Component
   ↓ (dispatches)
Presentation Hook (useMutation / useQuery via TanStack)
   ↓ (invokes)
Application Use-Case (Business Workflow)
   ↓ (calls via DI)
Infrastructure Repository (e.g., CartRepository)
   ↓ (resolves with)
Infrastructure HTTP Client (fetch API / axios)
   ↓
Backend API Endpoint (Rewrites / Proxy)
```

## 🔄 Status of API Integration

Our architecture enforces strict API contract validation to ensure 100% interoperability with our Go/Java microservices (User Port 8081, Product Port 8082, Cart Port 8083).

**Highlights from the recent API & Services Integration Audit:**

1. **Proxy Rewrites**: Mapped correctly in `next.config.mjs` to target microservices ports avoiding CORS & routing issues.
2. **Missing Token Roles**: Overrode cookie strategies safely to include claims (e.g. extracted roles from the access token) for `proxy.ts` middleware usage.
3. **Cart Service Fixes**: Synchronized frontend logic with Cart HTTP methods (`DELETE` for removal, `PATCH` for decrease/increase, `POST` for pricing queries) replacing old discrepancies in doc guidelines.
4. **Resiliency**: We account for missing `refreshToken` on refreshing, variable formats for `userId` (Long vs string), and fallback data properties natively via precise Zod Validation transformers in Infrastructure layers.

_For precise technical guidelines on code writing style, see the detailed inner files (e.g., `docs/ARCHITECTURE.md`)_.

---

## ✅ Quality Standards

- **Error Handling**: Use the explicit Error hierarchy (AppError -> HttpError/ValidationError -> NetworkError, etc.). Hook responses must be caught cleanly preventing silent failures.
- **State**: Keep 95% of state in server state (`@tanstack/react-query`) and use Zustand globally ONLY for client UI state contexts (e.g. collapsed sidebars, theme overrides).
- **Validation**: Enforced fully via Zod. API payloads are completely parsed and shielded before reaching UI Components.
