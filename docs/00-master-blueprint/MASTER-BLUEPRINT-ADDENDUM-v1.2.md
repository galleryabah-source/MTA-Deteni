# MTA DETENI — Master Blueprint Addendum v1.2

## Strategic Recommendation

MTA DETENI should proceed using an **Authorization Control Plane (ACP)** rather than a simple role-menu matrix.

The ACP becomes the authoritative security layer connecting:

`RBAC → ABAC → Policy Guardrails → Approval → Versioning → Audit → Runtime Enforcement`

This allows the Super Admin to configure permissions through checkboxes while preventing the console from becoming a privilege-escalation mechanism.

## Priority Architecture Decisions

### 1. Separate three kinds of authority

**Substantive authority**
- Head Rudenim
- PEJABAT_APPROVER
- RAP
- PERKES
- KAMTIB
- SUBBAG_TU

**System access governance**
- SUPER_ADMIN
- SYSTEM_ADMIN
- AUDITOR

**Technical runtime enforcement**
- Authorization Service/Policy Engine
- server-side Policy Enforcement Points
- audit engine

### 2. No direct role-to-menu authorization

The system must never rely on:

`role → show menu → allow action`

Instead:

`identity + role + permission + unit + domain + resource + action + workflow + context → policy decision`

UI visibility is only a convenience; authorization is server-side.

### 3. Permission catalog becomes a controlled contract

Every permission receives a stable identifier, domain, action, risk level, scope, restrictions, dependencies, incompatible permissions, and approval requirement.

### 4. Permission changes are policy changes

A checkbox modification is only a pending change until **Simpan Pengaturan** is executed and the change passes policy validation.

### 5. High-risk permissions require stronger controls

The system must be capable of requiring reason, re-authentication, second approval, or other policy-defined controls.

### 6. Policy versions are immutable

Every accepted RBAC policy change produces a new version and an audit record. Historical versions remain available for comparison and controlled rollback.

### 7. Restricted domains remain independently protected

PERKES health data is a separate authorization domain. The ability to administer roles does not automatically grant access to restricted health records.

## Recommended First Implementation Slice

Build in this order:

1. Permission catalog.
2. Baseline role matrix.
3. Policy guardrails.
4. Server-side authorization service.
5. Audit event contract.
6. Super Admin RBAC Console.
7. Policy versioning and diff.
8. Cache/session invalidation.
9. Authorization regression suite.
10. Privilege-escalation and rollback tests.

## MVP Security Principle

The most important rule is:

> **A user interface can request a permission change; only the server-side policy engine may authorize and commit it.**

## Compliance/Policy Alignment

The authority matrix must be reviewed against the actual Rudenim organizational mandate, current immigration regulations, internal SOPs, document governance, and personal-data protection requirements before production deployment.

UU No. 27 Tahun 2022 remains applicable and classifies health information, biometric data, genetic data, criminal records, child data, and financial data as specific personal data. MTA DETENI therefore retains domain/field-level restrictions and least-privilege access as architectural requirements.

Permen Imipas No. 2 Tahun 2025 on Immigration Supervision and Administrative Immigration Actions is currently in force and revoked Permenkumham No. 4 Tahun 2017; legal/SOP references used for deployment must therefore be validated against the current regulatory baseline.

## Final Architecture Direction

```text
                    MTA DETENI
                         │
        ┌────────────────┼────────────────┐
        │                │                │
  Substantive       Access Governance   Audit
   Authority        SUPER ADMIN          Engine
        │                │                │
        │          Authorization         │
        │             Control Plane      │
        │                │                │
        └───────────────┼────────────────┘
                        │
                 Policy Decision
                        │
                 ALLOW / DENY /
              STEP-UP / 2ND APPROVAL
                        │
                 Operational APIs
                        │
       ┌────────────────┼─────────────────┐
       │                │                 │
      RAP            PERKES           KAMTIB/TU
       │                │                 │
       └────────────────┴─────────────────┘
                        │
               Data + Workflow + Docs
                        │
                Timeline + Evidence
```

This addendum is part of the design baseline and must be considered together with the Master Blueprint v1.1, RBAC/ABAC matrix, Super Admin RBAC Console specification, Document Contract, acceptance criteria, and Roadmap v1.2.
