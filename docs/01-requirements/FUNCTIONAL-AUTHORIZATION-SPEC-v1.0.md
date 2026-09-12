# MTA DETENI — Functional & Authorization Specification v1.0

## 1. Purpose

This specification is the implementation contract between business requirements and the application. It defines actors, permissions, domains, workflow controls, field-level restrictions, document actions, leadership actions, and security-sensitive operations.

## 2. Authorization Decision

Every protected operation is evaluated as:

`ALLOW | DENY | STEP_UP | SECOND_APPROVAL`

Decision inputs:

- authenticated subject;
- active role(s);
- unit/site scope;
- permission;
- action;
- target resource;
- data domain/classification;
- workflow state;
- purpose/context;
- ownership/scope;
- policy version;
- break-glass state, if any.

Fail closed for protected operations.

## 3. Core Roles

`RAP`, `PERKES`, `KAMTIB_OPERATOR`, `KAMTIB_ADMIN`, `SUBBAG_TU`, `PEJABAT_APPROVER`, `HEAD_RUDENIM`, `AUDITOR`, `SYSTEM_ADMIN`, `SUPER_ADMIN`.

Role assignment alone does not grant unrestricted access; permissions and context remain authoritative.

## 4. Permission Families

### Identity/Admin
`IDENTITY.USER.VIEW/CREATE/EDIT/DISABLE`, role view/create/edit/disable.

### Deteni
`DETENI.VIEW/CREATE/EDIT/VERIFY/HISTORY.VIEW/ARCHIVE`.

### Documents
`DOCUMENT.VIEW/UPLOAD/REVISE/GENERATE/DOWNLOAD/PRINT/DISTRIBUTE/ARCHIVE/EXPORT`.

### Placement/Movement
`PLACEMENT.VIEW/ASSIGN/EDIT/VERIFY`, `MOVEMENT.VIEW/CREATE/EDIT/VERIFY/EXECUTE`, `HEADCOUNT.VIEW/EXECUTE/CORRECT`.

### Temporary Exit
`LEAVE.VIEW/CREATE/EDIT_DRAFT/VERIFY/APPROVE/REJECT/GENERATE_LETTER/DOWNLOAD_LETTER/RECORD_DEPARTURE/RECORD_RETURN/CLOSE`.

### Escort
`ESCORT.VIEW/CREATE/ASSIGN/EXECUTE/RECORD_RESULT/HISTORY.VIEW`.

### Escort Letter/TU
`ESCORT_LETTER.VIEW/VERIFY/GENERATE/REGISTER/DOWNLOAD/DISTRIBUTE/ARCHIVE`.

### Health
`HEALTH.OPERATIONAL_FLAG.VIEW`, `HEALTH.RECORD.VIEW_RESTRICTED/CREATE/EDIT/VERIFY`, `HEALTH.HISTORY.VIEW_RESTRICTED`, `HEALTH.RECOMMENDATION.CREATE`.

### Leadership
Dashboard/timeline/recommendation visibility plus `PETUNJUK`, `ARAHAN`, `REKOMENDASI`, `DISPOSISI`, acknowledgement, follow-up, response, closure, monitoring.

### Audit
Log view/search, evidence export, integrity verification.

### RBAC
`RBAC.POLICY.VIEW/PROPOSE/APPROVE/APPLY/ROLLBACK`, `RBAC.ROLE.MANAGE`, `RBAC.PERMISSION.CATALOG.MANAGE`.

### System
Configuration, jobs, storage, integrations, and security settings according to technical scope.

## 5. Domain Rules

### RAP
May manage administrative registration and completeness, administrative documents, requests, recommendations, and reports within scope. Must not edit restricted health data, operational placement, audit history, or final decisions outside mandate.

### PERKES
May create/edit/verify health records and medical recommendations. Health records are restricted and require dedicated authorization.

### KAMTIB
Owns operational placement, movement, headcount, security/incident records, temporary-exit operations, and escort operations. KAMTIB may generate/review the temporary-exit letter after prerequisites are satisfied.

### SUBBAG_TU
Owns administrative handling of the escort assignment letter: completeness, numbering/register, template selection, generation, distribution, and archive. It does not approve substantive temporary-exit decisions.

### PEJABAT_APPROVER
Approves only workflows explicitly assigned to the role through policy and formal authority.

### HEAD_RUDENIM
Has authorized oversight, timeline/dashboard visibility, and leadership-direction capabilities. The role is not equivalent to technical super-admin and does not automatically receive edit authority across every domain.

### SUPER_ADMIN
Manages authorization governance and system access policy. The role does not automatically receive substantive access to detainee or restricted health data.

### SYSTEM_ADMIN
Manages technical configuration. Technical privilege does not imply business-data privilege.

## 6. Workflow State Model

Generic critical record states:

`DRAFT → VERIFIED → APPROVED → ISSUED/EXECUTED → CLOSED`

Alternative terminal states:

`SUPERSEDED | VOIDED | REJECTED | CANCELLED`

Transitions require explicit authorization and produce audit events.

## 7. Temporary Exit Contract

`REQUEST → VALIDATE → VERIFY → APPROVE → GENERATE LETTER → ASSIGN ESCORT → DEPART → RETURN → RECORD RESULT → CLOSE`

A departure cannot be recorded unless required approval and operational prerequisites are satisfied. Return closes the operational loop and creates an event.

## 8. Escort Assignment Contract

`REQUEST → COMPLETENESS CHECK → ADMIN PREPARATION → AUTHORIZATION/SIGNATURE → REGISTER → DISTRIBUTE → EXECUTE → RESULT → ARCHIVE`

The administrative letter process is distinct from substantive operational approval.

## 9. Document Actions

Final document download is an auditable action. Generated documents are immutable artifacts bound to the template version used. Revisions create a new version/event.

## 10. Field-Level Security

Field visibility/editability is independently governed. Sensitive fields are not exposed merely because the parent record is visible. Restricted health data requires explicit permission and purpose/context.

## 11. RBAC Change Control

Super Admin checklist changes are proposals until saved. Save must validate dependencies, conflicts, privilege escalation, and critical-permission controls. Critical changes may require re-authentication and second approval. Every applied policy gets a new version and audit event.

## 12. Break-Glass

Break-glass access, if enabled by formal policy, must be:

- time-limited;
- resource/domain-specific;
- reason-required;
- re-authenticated;
- fully audited;
- automatically expired;
- subject to post-event review.

## 13. Prohibited Patterns

- client-only authorization;
- hidden-menu-as-security;
- role name used as sole authorization decision;
- self-granting critical privilege;
- unrestricted health export;
- direct ingestion into canonical records;
- hard delete of critical history;
- unversioned template replacement;
- unaudited final-document download;
- autonomous AI approval or substantive decision.

## 14. Acceptance Contract

A protected action is accepted only when positive and negative authorization tests pass, audit evidence is generated, workflow state is correct, and the operation remains consistent under retries and concurrent requests.
