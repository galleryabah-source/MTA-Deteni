# MTA DETENI — System Requirements v1.0

## Functional Requirements

### FR-01 Identity and Access
- secure authentication;
- role and attribute based authorization;
- deny-by-default;
- scoped access by domain and organizational responsibility;
- auditable privileged/break-glass access.

### FR-02 Master Data
- create, validate, update, and version detainee administrative records;
- maintain document metadata;
- maintain source/provenance and verification status.

### FR-03 Placement
- manage block, room, and bed;
- prevent invalid double assignment;
- record placement as events.

### FR-04 Movement
- record entry, transfer, temporary exit, return, and other authorized movements;
- maintain chronological ledger;
- derive current state from valid events.

### FR-05 Headcount
- support authorized headcount operations;
- barcode/QR-assisted identification;
- record time, actor, location, and result.

### FR-06 Documents
- generate controlled DOCX documents from approved templates;
- preserve template version, generator, timestamp, and document hash;
- route documents through approval where required.

### FR-07 Leave and Escort
- create requests;
- capture purpose, destination, schedule, escort data, and authority;
- support approval and completion/return status.

### FR-08 Intake
- accept authorized source data;
- preserve raw intake separately;
- extract structured fields;
- require validation before operational use.

### FR-09 Reporting
- operational dashboard;
- daily/periodic reports;
- pending work and alert views;
- export only for authorized users.

### FR-10 Audit
- record security-sensitive and business-critical actions;
- provide tamper-evident audit chain;
- support audit review.

## Non-Functional Requirements

- Security: OWASP-aligned secure design.
- Availability: appropriate to Rudenim operational requirements.
- Performance: common operational screens should remain responsive under expected load.
- Integrity: critical records must be transactionally consistent.
- Traceability: important data changes must be attributable.
- Privacy: data minimization, purpose limitation, restricted domains.
- Maintainability: typed contracts, automated tests, ADRs, documented migrations.
- Recoverability: tested backup and restore procedures.

## Acceptance Principle

No feature is production-ready until its functional behavior, authorization boundary, audit behavior, validation rules, failure modes, and test evidence are defined.
