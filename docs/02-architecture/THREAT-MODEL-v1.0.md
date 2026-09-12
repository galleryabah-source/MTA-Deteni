# MTA DETENI — Threat Model v1.0

## 1. Security Objective

Protect detainee administrative information, restricted health information, documents, authorization policy, audit evidence, and operational workflows from unauthorized disclosure, modification, destruction, impersonation, and abuse.

## 2. Primary Assets

- detainee identity/administrative records;
- health records and recommendations;
- placement, movement, headcount and security records;
- leave/escort records;
- generated official documents;
- templates and document registry;
- user identities, sessions and permissions;
- RBAC/ABAC policy;
- audit trail and integrity evidence;
- backups and recovery material;
- integration/intake payloads.

## 3. Threat Classes

### T1 — Unauthorized access
Mitigation: strong authentication, server-side authorization, least privilege, deny-by-default, restricted-domain controls, session protection.

### T2 — Privilege escalation
Mitigation: permission dependency/conflict engine, self-escalation prevention, critical-change second approval, policy versioning, authorization regression tests.

### T3 — Data tampering
Mitigation: transactional writes, immutable/versioned history, integrity metadata, audit chain, concurrency control, restricted update paths.

### T4 — Data leakage
Mitigation: field-level authorization, export controls, private object storage, response minimization, logging minimization, restricted health isolation.

### T5 — Spoofed or malformed intake
Mitigation: raw/quarantine vault, source authentication, schema validation, deduplication/idempotency, confidence scoring, human verification.

### T6 — Document misuse
Mitigation: controlled template registry, version binding, approval/issue separation, final-download audit, SHA-256 integrity metadata.

### T7 — Insider abuse
Mitigation: separation of duties, purpose/context checks, anomaly monitoring, audit review, break-glass controls, periodic access recertification.

### T8 — Availability failure
Mitigation: health/readiness checks, queue resilience, backups, restore drills, graceful degradation, operational runbooks.

### T9 — Supply-chain compromise
Mitigation: dependency pinning/review, lockfile discipline, vulnerability scanning, secret scanning, CI security gates, minimal runtime permissions.

### T10 — Authorization inconsistency
Mitigation: centralized policy contract, shared enforcement layer, negative authorization tests, policy simulator, no UI-only security.

## 4. Highest-Risk Operations

- changing RBAC/ABAC policy;
- accessing restricted health data;
- exporting sensitive data;
- issuing official documents;
- recording departure/return;
- changing placement/movement records;
- administrative impersonation/break-glass;
- modifying audit/security configuration.

These operations require stronger controls than ordinary read operations.

## 5. Security Invariants

1. Protected operations fail closed.
2. A browser cannot grant itself permission.
3. A role name alone cannot authorize a restricted operation.
4. Super Admin cannot silently grant itself unrestricted substantive data access.
5. Critical history cannot be silently overwritten.
6. Unverified intake cannot become an approved canonical record.
7. A document cannot be issued without required workflow state.
8. Security-critical policy changes are auditable and reversible.
9. Restricted data is not exposed through generic list/search endpoints.
10. Sensitive payloads are not placed in logs by default.

## 6. Security Verification

Before production: threat-model review, SAST/dependency/secret scans, authorization regression, privilege-escalation tests, API abuse tests, document integrity tests, audit-integrity tests, backup/restore drill, and UAT security review.
