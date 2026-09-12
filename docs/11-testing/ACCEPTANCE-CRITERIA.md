# MTA DETENI — Acceptance Criteria v1.0

## Governance

- [ ] MTA DETENI documented as a governance/process model.
- [ ] Digital system explicitly treated as supporting instrument.
- [ ] Authority matrix approved before production implementation.

## Access Control

- [ ] Deny-by-default.
- [ ] RAP cannot edit PERKES restricted data.
- [ ] PERKES cannot edit RAP/KAMTIB operational records without explicit permission.
- [ ] KAMTIB edit rights are role-scoped.
- [ ] SUBBAG TU can administer authorized correspondence without changing substantive detainee decisions.
- [ ] HEAD_RUDENIM can see authorized overall data/timeline but cannot directly edit operational records.
- [ ] Technical administrator does not automatically receive substantive access to sensitive data.

## Workflow

- [ ] Critical workflow separates input, verification, approval, execution, and closure where required.
- [ ] Temporary exit can be traced from request through approval, escort assignment, letter administration, departure, return, and closure.
- [ ] Every recommendation/direction has target, status, acknowledgement, and follow-up.

## Data Integrity

- [ ] Critical history is event/version based.
- [ ] Corrections preserve provenance.
- [ ] Audit events are append-only/tamper-evident.
- [ ] No production PII or health data exists in source control.

## Documents

- [ ] Letter templates are version controlled.
- [ ] Generated documents record template version, generator, timestamp, and approval reference.
- [ ] Surat Tugas workflow is linked to the related temporary-exit process.

## Privacy

- [ ] Health data is restricted by domain/field policy.
- [ ] Exports are controlled and audited.
- [ ] Retention and classification policy is defined before production.
