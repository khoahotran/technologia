# ADR 0001: Clean Architecture in `src/`

## Status
Accepted

## Decision
Use strict layer boundaries in `src/`:
- `domain`: entities/models/value objects/repository contracts only
- `application`: use-case orchestration only
- `infrastructure`: API/repository implementations/adapters
- `presentation`: UI and UI hooks only
- `store`: transient UI/session state only

## Why
- Keeps business rules independent from framework and transport details.
- Makes API migration (direct services -> gateway) local to infrastructure.
- Improves testability of use-cases and repositories.

## Consequences
- More interfaces/types, but lower coupling and safer refactors.
