# ADR 0003: Zustand Scope = Transient Client State Only

## Status
Accepted

## Decision
Use Zustand only for client session/UI state (auth session, theme, modal state), not server-owned domain data.

## Why
- Avoids stale duplicated data and manual synchronization issues.
- Query cache remains the single source of truth for server data.
- Keeps store usage predictable and small.

## Consequences
- Cart/product/user fetch results stay in TanStack Query.
- Zustand updates remain lightweight and synchronous.
