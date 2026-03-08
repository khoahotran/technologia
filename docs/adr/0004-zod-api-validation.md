# ADR 0004: Zod Validation at Infrastructure Boundary

## Status
Accepted

## Decision
Validate all backend responses in `src/infrastructure/api`/repository layer using Zod schemas before returning data to application layer.

## Why
- Backend wrappers are strict (`BaseResponse`, `PaginationBaseResponse`).
- Runtime validation catches API contract drift early.
- Prevents invalid payloads from propagating into UI and business logic.

## Consequences
- Repositories return parsed/normalized types only.
- Validation errors become explicit infrastructure failures.
