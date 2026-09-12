# MTA DETENI — Authorization Control Plane v1.0

## 1. Purpose

Authorization Control Plane (ACP) adalah lapisan pengendalian akses yang menjadi sumber keputusan authorization MTA DETENI. RBAC Console hanya menjadi administration interface; security enforcement tetap berada di server-side authorization layer.

## 2. Components

```text
Identity Provider / Session
        ↓
Subject Context
        ↓
RBAC Policy
        ↓
ABAC Context
        ↓
Policy Guardrails
        ↓
Authorization Decision Point (ADP)
        ↓
Policy Enforcement Point (PEP)
        ↓
ALLOW / DENY / STEP-UP / SECOND APPROVAL
        ↓
Audit Event
```

## 3. Context Inputs

Authorization dapat mempertimbangkan:

- user ID;
- role(s);
- unit/seksi;
- permission;
- target domain;
- target record;
- action;
- workflow state;
- data classification;
- purpose;
- ownership/context;
- time window;
- break-glass state;
- approval state.

## 4. Server-Side Enforcement

Setiap server action/API yang mengakses atau mengubah protected resource harus melakukan authorization check. Frontend checkbox/menu visibility tidak dianggap sebagai security control.

Contoh:

`authorize(subject, permission, resource, context) → decision`

## 5. Super Admin Boundary

Super Admin dapat mengelola authorization policy sesuai policy-management permissions, tetapi tidak memperoleh implicit access ke restricted detainee data.

`RBAC.POLICY.APPLY` dan `RBAC.POLICY.ROLLBACK` harus dilindungi oleh policy controls. `RBAC.PERMISSION.CATALOG.MANAGE` sebaiknya menjadi protected release/governance operation.

## 6. Atomic Policy Update

Policy changes menggunakan transaction/versioning:

```text
Load active policy
 → create proposed version
 → validate dependencies
 → detect conflicts
 → detect privilege escalation
 → require reason
 → step-up/second approval if needed
 → commit version atomically
 → audit
 → invalidate authorization cache
```

Tidak ada partial permission save.

## 7. Self-Escalation Protection

Sistem harus mencegah Super Admin/operator menggunakan policy management untuk mendapatkan privilege yang tidak semestinya, terutama:

- unrestricted access to own account;
- unrestricted restricted-health access;
- audit tampering;
- uncontrolled approval authority;
- unrestricted export;
- disabling security controls;
- creating an equivalent/broader administrator without required approval.

## 8. Policy Versioning

Active policy memiliki immutable version identifier. Proposed changes dibuat sebagai candidate version. Rollback membuat controlled new version yang mereferensikan version sebelumnya; tidak menghapus histori.

## 9. Cache and Session

Setelah policy activation:

- invalidate relevant authorization cache;
- define maximum stale-policy window;
- force re-evaluation for sensitive operations;
- optionally revoke sessions when critical permissions are revoked.

Exact cache implementation is an engineering decision to be finalized during D2.

## 10. Audit Requirements

Authorization changes and high-risk decisions must be auditable. At minimum record actor, subject/role affected, action, resource/domain, decision, policy version, reason where applicable, timestamp, correlation ID, and result.

## 11. Failure Mode

For protected operations, authorization service failure must fail closed. No fallback to allow because policy service/cache is unavailable.

## 12. Testing

Required tests include:

- default deny;
- role permission allow;
- missing permission deny;
- ABAC context deny;
- field/domain isolation;
- self-escalation denial;
- incompatible permission denial;
- second approval enforcement;
- revocation propagation;
- stale cache behavior;
- rollback;
- audit completeness;
- audit integrity;
- concurrent policy update handling.

## 13. Implementation Boundary

This is architecture/design only. No production schema migration or authorization policy change is authorized by this document alone.
