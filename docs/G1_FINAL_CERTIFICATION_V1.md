# G1 FINAL CERTIFICATION V1

## Scope

G1 closes the Legacy Detainee Code External / Operational Dependency investigation only when X2, X3, X4 and X5 evidence are considered together.

## Evidence state

### X2 — Import / Manual Procedure

**PARTIALLY CLOSED.**

Repository inspection found no dedicated operational detainee CSV/XLSX importer, spreadsheet loader, or production seed loader. Production UI create remains an active canonical create path and retains temporary legacy `code` compatibility input.

External/manual operator procedures outside the repository remain unverified.

### X3 — External Integration

**PARTIALLY CLOSED.**

Repository/runtime inspection found no alternate repository-owned detainee mutation integration, webhook receiver, dedicated detainee ETL, or alternate external outbox delivery path.

Undocumented external API consumers, operator scripts and scheduler infrastructure remain unverified.

### X4 — Privileged Writer / Credential Provenance

**PARTIALLY CLOSED.**

Authenticated direct detainee DML has been removed.

The direct authenticated execution seam for the privileged movement transaction has been removed.

Canonical privileged mutation functions are service-role-only.

However, external/admin credential custody and undocumented privileged operator paths remain unverified.

### X5 — Recovery Operator

**BLOCKED.**

The governed backup/restore surface is identified and synthetic DR certification exists.

Production `public.mta_restore_backup_transaction` is not provisioned.

No evidence currently establishes:
- backup archive owner;
- authorized restore operator;
- privileged recovery credential custodian;
- completed production recovery rehearsal;
- versioned backup transition removing legacy `code`.

## Overall G1 decision

**G1 = NOT CERTIFIED.**

The evidence is sufficient to establish the repository-owned canonical path and several important containment boundaries, but it is not sufficient to certify that all external/manual/recovery provenance has been closed.

This is an evidence boundary, not a claim that undocumented external consumers or operators exist.

## Legacy code decision

The current contract remains:

```
NID   = canonical operational identity
code  = temporary compatibility CREATE input
code UPDATE = DENY
READ = NID-first
DROP = BLOCKED
```

G2 replacement of the caller-supplied legacy code creation contract is **BLOCKED**.

## Required G1 closure actions

1. Identify the operational backup archive owner.
2. Identify authorized recovery operator(s).
3. Establish privileged recovery credential custody without exposing secrets.
4. Establish whether any external scheduler/operator/integration can create detainees or supply legacy `code`.
5. Govern and rehearse the restore operation against an approved non-production target.
6. Define a versioned backup schema transition that can preserve NID without requiring caller-supplied legacy `code`.
7. Re-run G1 final evidence review.

## Explicit non-actions

This certification does not:
- drop or rename `mta_detainees.code`;
- remove legacy `code` from CREATE;
- invent a legacy-code generator;
- provision the production restore function;
- rotate privileged credentials;
- execute a production restore.

G2 must not begin until the outstanding G1 evidence gaps are closed.
