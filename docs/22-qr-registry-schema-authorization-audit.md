# MTA DETENI — Canonical QR Registry Schema & Authorization Audit

Revision: 2026-09-22
Branch: fix/runtime-functional-audit-2026-09-22

## Verified production database state

Project: MTA DETENI (tmmhxqgzelgrsrxbbfzh)

Existing domain tables include:
- mta_detainees
- mta_placements
- mta_movements
- mta_leaves
- mta_documents
- mta_audit_events
- mta_profiles

All inspected MTA tables have RLS enabled.

The inspected pg_policies result contained no public policies. Therefore the current database posture is effectively deny-by-default for client-role table access. This is consistent with the foundation's governance intent and means a QR table must not be added with permissive policies.

## Authorization findings

mta_profiles currently defines roles: OWNER, ADMIN, EDITOR, REVIEWER, AUDITOR, VIEWER.

The current mta-api function authenticates a Bearer token and verifies an active profile before CRUD. Write roles are OWNER/ADMIN/EDITOR.

A canonical scope/ownership dimension is not present in the inspected domain tables. Therefore this audit does NOT invent an organizational scope column or weaken RLS to make QR resolution work.

## Canonical QR registry proposal

Table: mta_qr_registry

Minimum fields:
- id uuid primary key
- resource_type text — currently DETAINEE
- resource_id uuid — FK to mta_detainees.id
- token_hash text — store a verifier/hash, not the raw QR token
- token_version integer
- status text — ACTIVE/SUSPENDED/REVOKED
- context text — currently RUDENIM_STAY
- issued_at timestamptz
- expires_at timestamptz nullable
- created_by uuid nullable — FK auth.users
- revoked_at timestamptz nullable
- revoked_by uuid nullable — FK auth.users
- metadata jsonb
- created_at timestamptz
- updated_at timestamptz

Constraints:
- resource_type fixed to DETAINEE until another QR domain is explicitly approved
- status constrained to ACTIVE/SUSPENDED/REVOKED
- context constrained to approved values
- unique active token verifier
- foreign key resource_id → mta_detainees.id
- foreign key creator/revoker → auth.users

## Security rule

The persistence layer MUST NOT expose the raw token in normal reads. The resolver receives the scanned opaque token and the persistence adapter performs the verifier lookup. Protected projection happens only after authentication + authorization.

## Runtime-neutral rule

The resolver owns domain validation. Persistence adapters own lookup only.

LAN:
Local/LAN HTTP → local PostgreSQL → SharedQrRegistry

Cloud:
Supabase Edge/API → Supabase PostgreSQL → SharedQrRegistry

No UI code is allowed to know which persistence backend is active.

## Activation status

The design gate has now been executed on the controlled MTA DETENI Supabase project. Canonical scope authorization, QR registry RLS, and the database QR resolver were applied through the repository migrations `mta_canonical_scope_and_qr_registry`, `mta_scope_policy_hardening`, `mta_scope_policy_legacy_cleanup`, and `mta_qr_resolver_active_expiry_hardening`.

The live database contained zero detainee rows when the mandatory scope constraint was activated, so no real detainee records required backfill. The remaining authorization gate is authenticated multi-user isolation evidence using controlled non-production identities and synthetic scope/detainee records.

No real detainee/PII data is introduced by this activation.