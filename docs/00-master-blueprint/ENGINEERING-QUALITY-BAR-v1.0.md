# MTA DETENI — Engineering Quality Bar v1.0

## 1. Engineering Objective

MTA DETENI is engineered as a unified, resilient administrative platform intended to become a reference implementation for Rudenim in Indonesia. The target is not merely feature completeness; the target is correctness, security, traceability, maintainability, operational resilience, and controlled extensibility.

The application must behave as one coherent system: one authorization model, one canonical data model, one workflow model, one document governance model, one audit model, and one operational event model.

## 2. Quality Pillars

1. **Correctness** — business rules are explicit, validated, and testable.
2. **Security** — deny-by-default, least privilege, server-side authorization, protected restricted domains, secure sessions, audit integrity.
3. **Consistency** — shared domain contracts prevent contradictory behavior between modules.
4. **Traceability** — critical data and actions have provenance, actor, timestamp, reason, and history.
5. **Resilience** — failures are isolated, recoverable, observable, and tested.
6. **Performance** — critical workflows have measurable latency and concurrency targets.
7. **Maintainability** — modular boundaries, typed contracts, migration discipline, automated tests, and clear ownership.
8. **Operational readiness** — backup/restore, monitoring, incident response, access review, and release controls are part of the product.
9. **Interoperability** — APIs/events/document contracts are versioned and explicit.
10. **Human accountability** — automation and AI assist; authorized personnel remain accountable for substantive decisions.

## 3. Unified Architecture Rule

Every module must use the same:

- identity/session context;
- authorization decision service;
- validation and domain contracts;
- canonical identifiers;
- workflow state model;
- audit/event pipeline;
- document registry;
- notification mechanism;
- error taxonomy;
- observability conventions.

A module may not create a private authorization shortcut, duplicate business rule, or independent audit mechanism.

## 4. Domain Boundary Rule

Business domains are separated in code and data while remaining integrated through explicit contracts:

- RAP;
- PERKES;
- KAMTIB;
- SUBBAG_TU;
- Leadership;
- Documents;
- Workflow/Approval;
- Identity/RBAC/ABAC;
- Audit;
- Reporting;
- Controlled Intake.

Restricted health data is isolated by policy and technical enforcement. Technical administration does not imply substantive access.

## 5. Transaction Integrity

Critical operations must be atomic. Examples:

- approval + state transition;
- document issue + register event;
- RBAC policy change + policy version + audit event;
- departure/return + movement event;
- placement change + history event.

Partial state must be prevented or explicitly represented as recoverable workflow state.

## 6. No Silent Data Mutation

Critical records are versioned/evented. Corrections preserve history. Deletes are policy-controlled and, where required, represented as void/superseded rather than physical deletion.

## 7. Authorization Quality Bar

Authorization must be evaluated server-side using:

`subject + role + permission + action + resource + domain + workflow_state + context + policy_version`

The frontend may hide controls for usability but is never the security boundary.

## 8. Testing Pyramid

- unit tests for domain rules;
- contract tests for APIs and document fields;
- integration tests for database/workflow/authorization;
- E2E tests for critical user journeys;
- authorization regression and mutation tests;
- security regression;
- performance/load tests;
- backup/restore tests;
- document rendering regression;
- accessibility/usability checks where appropriate.

Critical authorization and workflow paths require negative tests, not only happy paths.

## 9. Observability

Every production-critical request should be correlatable through:

`request_id → actor → authorization_decision → domain_action → event → document/job → result`

Logs must avoid unnecessary sensitive payloads. Metrics and traces should be useful without exposing restricted data.

## 10. Release Gates

No production release without:

- type/build validation;
- migration review;
- unit/integration/E2E tests;
- authorization regression;
- security checks;
- secret/dependency scanning;
- audit-integrity validation;
- document regression;
- backup/restore evidence;
- operational runbook;
- rollback plan;
- acceptance evidence.

## 11. Data Safety

Repository fixtures are synthetic. Real detainee, health, biometric, identity, credential, message-export, or operationally sensitive data must never be committed.

## 12. Scalability Direction

The initial deployment may be a controlled single-instance or private deployment, but internal boundaries must permit later scaling across Rudenim without redesigning core domain rules. Tenant/site scope must be explicit; cross-site access must never be inferred from a user's job title alone.

## 13. Definition of Done

A feature is done only when its:

- requirement;
- authority rule;
- data contract;
- workflow states;
- UI/API behavior;
- audit behavior;
- security controls;
- tests;
- observability;
- documentation;
- migration/rollback impact

are all defined and verified.
