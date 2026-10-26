# MTA DETENI — Core Engine Build Order v1.0

## Purpose

Build the reusable engine before implementing large domain features. This prevents fragmented authorization, duplicated workflow logic and inconsistent audit behavior.

## Build sequence

### E0 — Kernel primitives
- Result/Error contracts
- identifiers
- clock abstraction
- correlation IDs
- idempotency contract
- configuration contract

### E1 — Authorization kernel
- Permission model
- RBAC evaluation
- ABAC predicates
- scope evaluation
- purpose/context
- deny-by-default
- decision explanation

### E2 — Policy guardrails
- separation of duties
- self-escalation prevention
- critical-action classification
- second-approval requirement
- restricted-domain rules

### E3 — Workflow kernel
- state machine
- transition guards
- actor requirements
- prerequisite evaluation
- idempotent commands

### E4 — Audit kernel
- audit event contract
- correlation
- before/after references
- integrity chaining contract
- security-event separation

### E5 — Data governance kernel
- classification
- field/domain restrictions
- provenance
- retention policy interface
- export/download policy

### E6 — Document kernel
- template registry interface
- versioning
- placeholder validation
- document hash
- register/distribution/archive lifecycle

### E7 — Resilience kernel
- AI Gateway
- external dependency isolation
- timeout/retry/circuit breaker
- fallback
- degraded-mode result

### E8 — Infrastructure adapters
- PostgreSQL repository adapter
- identity adapter
- private object storage
- queue
- observability

### E9 — Application shell
- Next.js App Router
- route protection
- server-side authorization enforcement
- error boundaries
- request correlation
- health/readiness endpoints

### E10 — Domain modules
Only after E0-E9 contracts are stable:

1. D3 Core Administration
2. D4 Movement/Headcount/Temporary Exit
3. D5 Document Engine integration
4. D6 Workflow/Approval/RBAC administration
5. D7 Intake
6. D8 Reporting
7. D9 hardening/UAT
8. D10 production/institutionalization

## Non-negotiable gate

No domain module may introduce its own parallel authorization engine, audit format, workflow state machine or AI provider integration.

## Migration gate

E0-E7 may be implemented without database migrations. PostgreSQL schema/migrations are authorized only after contracts are reviewed and the logical model is frozen.
