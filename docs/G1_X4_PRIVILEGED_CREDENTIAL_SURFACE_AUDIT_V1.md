# G1-X4 Privileged Credential Surface Audit V1

Date: 2026-10-02

## Objective

Inventory deployed privileged credential consumers relevant to mta_detainees and distinguish proven runtime consumers from unresolved external or administrative credential provenance.

## Production deployed Edge Functions

The production project currently exposes these active Edge Functions:

| Function | Version | JWT | Service-role credential observed | Detainee DML role |
|---|---:|---:|---|---|
| mta-api | 24 | required | YES | canonical |
| mta-outbox-dispatcher | 2 | required | YES | indirect/outbox only |
| mta-login | 1 | not required | YES | auth/profile lookup only |

No additional active Edge Function was returned by the production function inventory.

## Provenance classification

### P1 — mta-api

Proven runtime privileged consumer.

The deployed source creates a service-role client only after authenticated user/RBAC processing for protected server-side operations. Detainee mutation reaches:

mta-api -> mta_execute_idempotent_mutation -> mta_internal.execute_idempotent_mutation

and movement reaches:

mta-api -> mta_execute_movement_transaction

The generic mutation boundary is service-role-only and internally enforces the service-role requirement.

### P2 — mta-outbox-dispatcher

Proven privileged consumer, but not a detainee table writer.

The function uses the service-role key to claim, complete, and release outbox events. Its deployed source does not directly access mta_detainees.

### P3 — mta-login

Proven privileged consumer for authentication/profile operations.

The function uses the service-role key to resolve mta_profiles and Supabase Auth users, then verifies the supplied password with the anon client. No mta_detainees mutation path was identified.

### P4 — external/scheduled/operator service-role credential holders

UNVERIFIED.

The available production function inventory establishes deployed server-side consumers, but does not prove that no external client, scheduled job, local operator script, CI secret, or other system possesses a service-role credential.

Secret values were not inspected or exposed.

### P5 — postgres administrative writer provenance

UNVERIFIED.

Production catalog evidence shows postgres retains administrative DML capability on mta_detainees. This is not being revoked in G1-X4 because it is an administrative capability, not evidence of misuse. A separate provenance/control decision is required to establish who can exercise that capability and under what governed procedure.

## Production writer controls now proven

- authenticated table INSERT/UPDATE/DELETE on mta_detainees: REMOVED.
- authenticated direct execution of mta_internal.execute_movement_transaction: REMOVED.
- anon direct execution of mta_internal.execute_movement_transaction: REMOVED.
- service_role execution of the internal movement writer: PRESENT.
- public movement wrapper: service-role-only.
- generic idempotent mutation function: service-role-only.
- recent canonical detainee audit evidence previously observed under P9.7-DURABLE-v1.

## Current G1-X4 conclusion

Credential/runtime inventory is materially narrowed, but G1-X4 is not fully certified.

Remaining closure items:

1. prove or govern all non-Edge external/scheduled holders of service-role credentials;
2. establish administrative postgres writer provenance;
3. retain production telemetry demonstrating that detainee mutations continue to arrive through canonical boundaries;
4. reconcile any historical/out-of-band operational procedures before G1 certification.

No service-role or postgres DML privilege is revoked by this audit.

## Gate state

G1-X4 privileged writer provenance = PARTIALLY CLOSED / PROVEN RUNTIME SURFACE, EXTERNAL + ADMIN PROVENANCE OPEN

G1 certification = BLOCKED
