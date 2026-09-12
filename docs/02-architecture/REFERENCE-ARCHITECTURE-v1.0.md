# MTA DETENI — Reference Architecture v1.0

## 1. Architecture Goal

Build one coherent platform rather than a collection of disconnected features. Domain modules share common identity, authorization, data contracts, workflow, events, documents, audit, notifications, and observability.

## 2. Logical Architecture

```text
Users / Authorized Clients
        ↓
Web UI / API Clients
        ↓
Session + Identity Context
        ↓
Authorization Control Plane
  ├─ RBAC
  ├─ ABAC / context
  ├─ dependency/conflict rules
  ├─ escalation protection
  └─ step-up / second approval
        ↓
Domain Application Layer
  ├─ Deteni
  ├─ RAP
  ├─ PERKES
  ├─ KAMTIB
  ├─ TU
  ├─ Leave / Escort
  ├─ Documents
  ├─ Leadership
  └─ Reporting
        ↓
Transaction + Domain Services
        ↓
PostgreSQL / Private Object Storage / Job Queue
        ↓
Event + Audit Pipeline
        ↓
Observability / Reporting / Alerts
```

## 3. Canonical Data Principle

PostgreSQL is the canonical operational source of truth. Object storage holds controlled binary artifacts such as documents and attachments. Every artifact is referenced by stable IDs and metadata. Derived views, dashboards, caches, and search indexes are not authoritative sources.

## 4. Domain Services

Business rules live in domain/application services, not only in UI components or API route handlers. Each critical service exposes typed input/output contracts and emits domain events when state changes.

## 5. Transaction Boundary

Critical multi-record operations must execute transactionally. Idempotency keys are required for externally retried commands such as document generation, message ingestion, and workflow commands where duplicate execution would be harmful.

## 6. Event Model

Domain events are append-oriented records representing material state changes. Events support timeline construction, audit correlation, notifications, reporting, and recovery workflows. An event is not permission to bypass the canonical state machine.

## 7. Authorization Control Plane

Authorization is centralized conceptually and enforced server-side. Policy decisions are deterministic, versioned, auditable, and fail closed for protected actions. Modules must not implement independent ad-hoc role checks that can contradict the central policy.

## 8. Workflow Engine

Workflow transitions are explicit commands:

`command → authorization → preconditions → transaction → state transition → event → audit → notification`

Retries must be safe. Invalid transitions are rejected rather than silently normalized.

## 9. Document Engine

The Document Engine consumes approved domain data and a specific active template version. It validates placeholders, creates the DOCX artifact, computes integrity metadata, registers the document, and emits an audit event. It never changes substantive approval state by itself.

## 10. Intake Pipeline

External/edge inputs are isolated from canonical records:

`source → raw vault → extraction → structured draft → validation → human verification → command → canonical record`

This protects the operational database from malformed, duplicated, spoofed, or low-confidence input.

## 11. Reliability Patterns

Required patterns include:

- database transactions;
- optimistic/concurrency controls for critical state;
- idempotency;
- bounded retries with backoff;
- dead-letter handling for asynchronous jobs;
- explicit timeout policies;
- health/readiness checks;
- graceful failure;
- backup and restore validation;
- documented rollback.

## 12. Security Boundaries

Trust boundaries exist between browser/client and server, identity and application, application and database, application and object storage, application and external integrations, and restricted domains. Secrets remain server-side and outside source control.

## 13. Multi-Rudenim Direction

The architecture is site-aware from the beginning. Every operational record that requires site scope carries an explicit site/Rudenim context. Cross-site visibility is policy-driven. The design must support a national reference model without assuming that all Rudenim have identical local workflows; configurable policy and templates must not weaken central controls.

## 14. Deployment Direction

Initial production should favor controlled private infrastructure appropriate to the sensitivity of detainee information. The application must remain deployable as a modular monolith first; extraction into separate services is permitted only when justified by scale, reliability, security isolation, or operational ownership.

## 15. Architectural Decision Rule

Prefer a well-tested modular monolith over premature microservices. The application becomes distributed only where the operational benefit clearly outweighs added consistency, deployment, debugging, and security complexity.
