# MTA DETENI — D2 Core Kernel Implementation Status

## Status

**D2 implementation is active.** This branch contains the first executable security/workflow/audit kernel layer. Database schema and migrations remain intentionally locked.

## Implemented

### Security / Authorization
- typed authorization request/decision contracts;
- deny-by-default authorization engine;
- permission/domain/action checks;
- unit and ownership scope checks;
- purpose requirement;
- restricted PERKES boundary;
- critical second-approval hook;
- policy guardrails for self-privilege escalation and sensitive export/download;
- unified `CoreSecurityEngine` composition point.

### Workflow
- generic typed state-machine contract;
- explicit transition allow-list;
- permission guard;
- separation-of-duties guard;
- second-approval guard;
- idempotency key carried by transition contract.

### Audit
- typed audit event contract;
- pure SHA-256 hash-chain construction;
- deterministic canonical event representation;
- chain verification and tamper detection;
- no raw sensitive payload is required by the integrity primitive.

### Tests
Unit coverage has been added for:
- deny-by-default authorization;
- restricted health purpose enforcement;
- workflow transition guards;
- separation of duties;
- audit chain creation and tamper detection.

## Still locked / not yet implemented

- PostgreSQL schema/migrations;
- production identity/session adapter;
- persistence adapters;
- RLS policies;
- object storage adapter;
- Next.js application shell;
- domain CRUD/API routes;
- Document Engine production generation;
- notification adapters;
- operational deployment.

## Next implementation order

`E0 Kernel → E1 Authorization → E2 Policy → E3 Workflow → E4 Audit → E5 Data Governance → E6 Document → E7 Resilience → E8 Adapters → E9 Application Shell → E10 Domain Modules`

No domain module may bypass these shared engines.
