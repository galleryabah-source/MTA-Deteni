# MTA DETENI — RBAC ↔ API ↔ RLS Parity Audit

Date: 2026-09-22
Scope: synthetic repository audit only.

## Current canonical roles

OWNER, ADMIN, EDITOR, REVIEWER, AUDITOR.

Legacy role VIEWER still exists in the historical production RBAC migration. It is not accepted by the application login gate.

## Verified API action policy

- READ: OWNER, ADMIN, EDITOR, REVIEWER, AUDITOR
- CREATE: OWNER, ADMIN, EDITOR
- UPDATE: OWNER, ADMIN, EDITOR
- DELETE: OWNER, ADMIN

The API is fail-closed with RBAC_ACTION_DENIED.

## Verified RLS policy observations

The RBAC migration currently grants authenticated SELECT access to the operational domain tables and constrains writes by role.

Detainees and documents:
- INSERT/UPDATE: OWNER, ADMIN, EDITOR
- DELETE: OWNER, ADMIN

Placements, movements, and leaves:
- current migration uses a single FOR ALL policy for OWNER, ADMIN, EDITOR.
- therefore EDITOR currently has direct database DELETE capability on these three tables if a client reaches Supabase directly.

Audit events:
- SELECT: OWNER, ADMIN, AUDITOR.
- REVIEWER is not granted audit-event SELECT.

Storage:
- SELECT: all five canonical roles.
- INSERT/UPDATE: OWNER, ADMIN, EDITOR.
- DELETE: OWNER, ADMIN.

## Application alignment performed

Because migration changes remain frozen, the application was aligned downward to the current RLS boundary where there was a mismatch:
- REVIEWER no longer receives the Audit navigation item.
- AUDIT client action policy is OWNER, ADMIN, AUDITOR.

## Remaining governance gap — not executed

The three FOR ALL policies for placements, movements, and leaves are broader than the API DELETE policy. This is a direct-DB privilege drift, not an application/API bypass.

Required future migration change, only after migration-freeze clearance:
- replace each FOR ALL policy with explicit INSERT/UPDATE policies for OWNER/ADMIN/EDITOR and DELETE policy for OWNER/ADMIN.

The current audit intentionally does not modify or execute that migration.

## Security conclusion

The application/API boundary is fail-closed and is not broader than the intended action matrix. A database-policy hardening migration remains required before claiming complete direct-Supabase RLS parity for DELETE on placements, movements, and leaves.
