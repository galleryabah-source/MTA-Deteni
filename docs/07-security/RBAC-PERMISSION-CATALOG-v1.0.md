# MTA DETENI — RBAC Permission Catalog v1.0

## Status
Design baseline — implementation must wait for D1/D2 approval.

## 1. Permission Model

Each permission is evaluated as:

`SUBJECT → ROLE → PERMISSION → DOMAIN → ACTION → SCOPE → CONTEXT → POLICY → DECISION`

Decision values:

- `ALLOW`
- `DENY`
- `STEP_UP`
- `SECOND_APPROVAL`

## 2. Risk Classes

- `LOW` — ordinary read/basic operational action.
- `MEDIUM` — controlled write/generate action.
- `HIGH` — approval, export, sensitive document, or broad administrative action.
- `CRITICAL` — RBAC management, audit administration, restricted-data access, break-glass.

## 3. Permission Catalog

### A. Identity & Administration

| Permission | Risk | Default | Notes |
|---|---|---|---|
| `IDENTITY.USER.VIEW` | LOW | DENY | User profile visibility |
| `IDENTITY.USER.CREATE` | MEDIUM | DENY | Create system user |
| `IDENTITY.USER.EDIT` | MEDIUM | DENY | Edit account metadata |
| `IDENTITY.USER.DISABLE` | HIGH | DENY | Disable account |
| `IDENTITY.ROLE.VIEW` | LOW | DENY | View roles |
| `IDENTITY.ROLE.CREATE` | HIGH | DENY | Create role |
| `IDENTITY.ROLE.EDIT` | HIGH | DENY | Edit role |
| `IDENTITY.ROLE.DISABLE` | HIGH | DENY | Disable role |

### B. Deteni — Administrative

| Permission | Risk | Default | Scope |
|---|---|---|---|
| `DETENI.VIEW` | LOW | DENY | Approved operational data |
| `DETENI.CREATE` | MEDIUM | DENY | Initial registration |
| `DETENI.EDIT` | MEDIUM | DENY | Administrative fields |
| `DETENI.VERIFY` | HIGH | DENY | Verification |
| `DETENI.HISTORY.VIEW` | MEDIUM | DENY | Timeline/history |
| `DETENI.ARCHIVE` | HIGH | DENY | Controlled archive |

### C. Documents

| Permission | Risk | Default |
|---|---|---|
| `DOCUMENT.VIEW` | LOW | DENY |
| `DOCUMENT.UPLOAD` | MEDIUM | DENY |
| `DOCUMENT.REVISE` | MEDIUM | DENY |
| `DOCUMENT.GENERATE` | MEDIUM | DENY |
| `DOCUMENT.DOWNLOAD` | MEDIUM | DENY |
| `DOCUMENT.PRINT` | MEDIUM | DENY |
| `DOCUMENT.DISTRIBUTE` | HIGH | DENY |
| `DOCUMENT.ARCHIVE` | HIGH | DENY |
| `DOCUMENT.EXPORT` | HIGH | DENY |

### D. Placement

- `PLACEMENT.VIEW`
- `PLACEMENT.ASSIGN`
- `PLACEMENT.EDIT`
- `PLACEMENT.VERIFY`

Default: DENY. Scope must be restricted to the user's operational unit/context.

### E. Movement & Headcount

- `MOVEMENT.VIEW`
- `MOVEMENT.CREATE`
- `MOVEMENT.EDIT`
- `MOVEMENT.VERIFY`
- `MOVEMENT.EXECUTE`
- `HEADCOUNT.VIEW`
- `HEADCOUNT.EXECUTE`
- `HEADCOUNT.CORRECT`

`MOVEMENT.CORRECT`/controlled correction is HIGH and must preserve event history.

### F. Temporary Exit

- `LEAVE.VIEW`
- `LEAVE.CREATE`
- `LEAVE.EDIT_DRAFT`
- `LEAVE.VERIFY`
- `LEAVE.APPROVE`
- `LEAVE.REJECT`
- `LEAVE.GENERATE_LETTER`
- `LEAVE.DOWNLOAD_LETTER`
- `LEAVE.RECORD_DEPARTURE`
- `LEAVE.RECORD_RETURN`
- `LEAVE.CLOSE`

Approval and issue permissions are separated.

### G. Escort

- `ESCORT.VIEW`
- `ESCORT.CREATE`
- `ESCORT.ASSIGN`
- `ESCORT.EXECUTE`
- `ESCORT.RECORD_RESULT`
- `ESCORT.HISTORY.VIEW`

### H. Surat Tugas Pengawalan — TU

- `ESCORT_LETTER.VIEW`
- `ESCORT_LETTER.VERIFY`
- `ESCORT_LETTER.GENERATE`
- `ESCORT_LETTER.REGISTER`
- `ESCORT_LETTER.DOWNLOAD`
- `ESCORT_LETTER.DISTRIBUTE`
- `ESCORT_LETTER.ARCHIVE`

### I. PERKES / Restricted Health

- `HEALTH.OPERATIONAL_FLAG.VIEW`
- `HEALTH.RECORD.VIEW_RESTRICTED`
- `HEALTH.RECORD.CREATE`
- `HEALTH.RECORD.EDIT`
- `HEALTH.RECORD.VERIFY`
- `HEALTH.HISTORY.VIEW_RESTRICTED`
- `HEALTH.RECOMMENDATION.CREATE`

`HEALTH.RECORD.VIEW_RESTRICTED` is HIGH/CRITICAL depending on data classification and must be separately scoped.

### J. KAMTIB

- `KAMTIB.OPERATIONAL.VIEW`
- `KAMTIB.PLACEMENT.EDIT`
- `KAMTIB.INCIDENT.CREATE`
- `KAMTIB.INCIDENT.EDIT`
- `KAMTIB.BARCODE.GENERATE`
- `KAMTIB.BLOCK_LIST.GENERATE`
- `KAMTIB.LEAVE.MANAGE`
- `KAMTIB.ESCORT.MANAGE`

### K. RAP

- `RAP.REGISTRATION.CREATE`
- `RAP.ADMIN.EDIT`
- `RAP.DOCUMENT.MANAGE`
- `RAP.COMPLETENESS.VERIFY`
- `RAP.DEPORTATION.REQUEST`
- `RAP.LEAVE.REQUEST`
- `RAP.RECOMMENDATION.CREATE`
- `RAP.REPORT.VIEW`

### L. Leadership

- `LEADERSHIP.DASHBOARD.VIEW`
- `LEADERSHIP.TIMELINE.VIEW`
- `LEADERSHIP.RECOMMENDATION.VIEW`
- `LEADERSHIP.DIRECTIVE.CREATE`
- `LEADERSHIP.INSTRUCTION.CREATE`
- `LEADERSHIP.DISPOSITION.CREATE`
- `LEADERSHIP.FOLLOWUP.VIEW`

These do not grant operational record edit.

### M. Audit

- `AUDIT.LOG.VIEW`
- `AUDIT.LOG.SEARCH`
- `AUDIT.EVIDENCE.EXPORT`
- `AUDIT.INTEGRITY.VERIFY`

Audit modification/deletion is prohibited through normal RBAC.

### N. RBAC Administration

- `RBAC.POLICY.VIEW`
- `RBAC.POLICY.PROPOSE`
- `RBAC.POLICY.APPROVE`
- `RBAC.POLICY.APPLY`
- `RBAC.POLICY.ROLLBACK`
- `RBAC.ROLE.MANAGE`
- `RBAC.PERMISSION.CATALOG.MANAGE`

`RBAC.PERMISSION.CATALOG.MANAGE` is CRITICAL and should normally be locked behind governance/release controls.

### O. System Administration

- `SYSTEM.CONFIG.VIEW`
- `SYSTEM.CONFIG.EDIT`
- `SYSTEM.JOBS.MANAGE`
- `SYSTEM.STORAGE.MANAGE`
- `SYSTEM.INTEGRATION.MANAGE`
- `SYSTEM.SECURITY.SETTINGS`

Technical access does not imply substantive detainee-data access.

## 4. Role Baseline

| Role | Baseline |
|---|---|
| `RAP` | RAP domain + required document/read permissions |
| `PERKES` | Restricted health domain + minimum operational visibility |
| `KAMTIB_OPERATOR` | KAMTIB operational execution |
| `KAMTIB_ADMIN` | KAMTIB administration |
| `SUBBAG_TU` | Document administration, register, Surat Tugas |
| `PEJABAT_APPROVER` | Formal approval permissions only |
| `HEAD_RUDENIM` | Leadership visibility/direction, read-only operational records |
| `AUDITOR` | Audit/read scope only |
| `SYSTEM_ADMIN` | Technical administration only |
| `SUPER_ADMIN` | Authorization governance, not automatic substantive data access |

## 5. Permission Dependency Rules

Examples:

`LEAVE.DOWNLOAD_LETTER` requires `LEAVE.VIEW`.

`LEAVE.GENERATE_LETTER` requires appropriate `LEAVE.VIEW` plus prerequisite workflow state.

`ESCORT_LETTER.GENERATE` requires `ESCORT_LETTER.VIEW` and valid escort process context.

`RBAC.POLICY.APPLY` requires policy-management authority and successful validation.

Dependencies are enforced server-side; checkbox UI is not the security boundary.

## 6. Incompatible Permission Examples

Policy should detect combinations such as:

- operator + unrestricted approval of their own transaction;
- auditor + operational edit;
- TU + substantive leave approval;
- PERKES + unrestricted operational edit outside health mandate;
- technical admin + automatic restricted-health access;
- user + uncontrolled self-role escalation.

Exact incompatibilities must be validated against the official organizational authority matrix.

## 7. Checkbox State Semantics

- `CHECKED` = explicit grant in proposed policy.
- `UNCHECKED` = explicit deny/no grant.
- `LOCKED` = policy cannot be changed through ordinary console.
- `INHERITED` = supplied by role/group/policy inheritance.
- `CONFLICT` = proposed combination violates a policy constraint.
- `HIGH_RISK` = grant requires enhanced confirmation.

## 8. Governance Rule

The catalog is a technical design baseline, not a substitute for official delegation of authority. Before production, every permission must be mapped to the applicable regulation, SOP, job description, and formal authority.
