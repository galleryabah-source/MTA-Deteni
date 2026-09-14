# MTA DETENI — Core Engine Solidity Contract v1.0

## Status
Mandatory architectural contract for D2 and all subsequent phases. This document defines how the application remains one coherent system as domain modules grow.

## 1. Objective

MTA DETENI SHALL be implemented as one platform with shared core engines, not as a collection of independent feature modules.

Domain modules may evolve independently, but they MUST use the same authorization, workflow, audit, data-governance, document, resilience, and observability contracts.

## 2. Layering

```text
Presentation
    -> Application Services
        -> Policy / Authorization
            -> Domain Services
                -> Repository Ports
                    -> Infrastructure Adapters
```

No layer may bypass the layer immediately below it for convenience.

## 3. Core Engines

The platform core consists of:

- Authorization Engine — RBAC + ABAC + scope + workflow state + purpose + context.
- Policy Engine — deny-by-default, separation of duties, escalation detection, critical-action controls.
- Workflow Engine — explicit state machines, guarded transitions, actor requirements, idempotency.
- Audit Engine — append-oriented security/business events, correlation, integrity metadata.
- Data Governance Engine — classification, purpose, provenance, retention, restricted-domain controls.
- Document Engine — template/version/placeholder/register/hash/lifecycle integrity.
- Resilience Engine — timeout, retry, circuit breaker, fallback, idempotency and graceful degradation.
- Observability Engine — structured logs, metrics, traces and security events.

## 4. Domain Firewall

RAP, PERKES, KAMTIB, SUBBAG_TU, leadership and other domains MUST NOT directly manipulate another domain's persistence model.

Cross-domain actions MUST use an application/domain service contract and pass authorization before mutation.

PERKES restricted health information MUST have an additional policy boundary. A general detainee view MUST NOT imply health-record access.

## 5. Transaction Rules

Core business transactions MUST:

1. validate input;
2. evaluate authorization;
3. validate workflow transition;
4. enforce idempotency where applicable;
5. execute the domain mutation atomically;
6. record required audit/event information;
7. return a typed result.

External AI, external HTTP providers, email delivery, document rendering services and other unreliable infrastructure MUST NOT hold open the core database transaction.

## 6. Error Model

Expected operational failures MUST be represented as typed outcomes where practical. Infrastructure failures MUST NOT expose secrets, provider credentials, internal stack traces or sensitive detainee data to clients.

Optional subsystem failure MUST remain local to that subsystem. An AI outage MUST NOT become a global application error.

## 7. Idempotency

Mutations that can be retried because of network interruption, queue redelivery or client retry MUST have an idempotency strategy.

The same logical command MUST NOT create duplicate leave requests, escort orders, documents, registrations or other state-changing business objects.

## 8. Immutability Boundaries

The following are append-oriented or versioned by design:

- audit events;
- status/history events;
- document issuance history;
- authorization decisions for auditable actions;
- policy versions;
- template versions;
- critical configuration changes.

Corrections MUST create a new event/version rather than silently rewriting historical truth.

## 9. Dependency Direction

Domain code MUST depend on ports/contracts, not on concrete infrastructure providers.

Examples:

- AI domain capability -> AiGateway port, never provider SDK.
- Document generation -> DocumentRenderer port.
- Storage -> ObjectStorage port.
- Identity -> IdentityProvider port.
- Notifications -> Notification port.
- Queue -> JobQueue port.

This permits infrastructure replacement without rewriting domain logic.

## 10. Configuration Safety

Configuration SHALL be validated at startup. Missing optional provider configuration MUST disable that optional capability safely rather than preventing the core application from starting.

Secrets MUST come from the runtime secret mechanism and MUST NOT be committed to the repository.

## 11. Security Invariants

- Deny by default.
- Least privilege.
- Separation of duties.
- No self-escalation.
- Restricted domains require explicit authorization.
- Export/download is an explicit permission, not an implied read permission.
- Technical SUPER_ADMIN access does not imply substantive detainee-domain access.
- Audit records cannot be deleted through ordinary application flows.

## 12. Availability Invariants

The application MUST remain usable when:

- all external AI providers are unavailable;
- a notification provider is unavailable;
- a document provider is temporarily unavailable, where a deterministic local path exists;
- a queue worker is unavailable, provided synchronous core transactions do not depend on it;
- telemetry is degraded.

Degraded dependencies may reduce optional capabilities, but MUST NOT corrupt or block unrelated core business transactions.

## 13. Testing Contract

Before a domain is considered production-ready it MUST demonstrate:

- authorization allow/deny coverage;
- privilege-escalation rejection;
- restricted-domain isolation;
- invalid workflow transition rejection;
- idempotent retry behavior;
- audit event creation;
- failure isolation of optional dependencies;
- no sensitive-data leakage in errors/logs;
- deterministic behavior for critical business rules.

## 14. Schema Gate

This contract does NOT authorize database migrations. Schema implementation begins only after the domain model, data dictionary, authorization model, workflow contracts and acceptance criteria are aligned.

## 15. Definition of Solid

MTA DETENI is considered structurally solid when adding a new domain capability does not require copying authorization, audit, workflow, error-handling, resilience or data-governance logic into that module.

The correct unit of reuse is the core engine contract, not duplicated feature code.
