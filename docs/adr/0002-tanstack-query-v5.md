# ADR 0002: TanStack Query v5 for Server State

## Status
Accepted

## Decision
Use TanStack Query v5 as the default server-state layer, with centralized client config in `src/app/query-client.ts`.

## Why
- Handles fetch/caching/revalidation/mutation lifecycles consistently.
- Supports optimistic mutations for cart UX.
- Reduces manual loading/error flags and ad-hoc cache logic.

## Consequences
- Server state should not be duplicated in Zustand.
- Query key factories are required for consistency.
