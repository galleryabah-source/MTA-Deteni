# G1-X2 Import / Manual Procedure Closure V1

Date: 2026-10-02

## Objective

Determine whether an operational import or manual procedure can create or mutate detainees outside the canonical mta-api path and whether such a procedure remains a legacy-code creation dependency.

## Repository evidence

Repository tree and targeted searches were inspected for CSV/XLSX/spreadsheet import, detainee import modules, manual seed/production loaders, scripts that create detainees, direct database import paths, and backup/restore as a recovery path.

No dedicated operational detainee import implementation was identified in the inspected repository surface.

The main runtime's synthetic seed data is explicitly marked SYNTHETIC_SEED and is not evidence of an operational production import procedure.

The production UI create path remains a normal detainee creation form. It currently sends entryYear, legacy code compatibility input, and detainee attributes through the canonical domain command and production adapter to mta-api.

The application therefore has a compatibility-bearing CREATE input, but no separate import pipeline was established.

## Production audit evidence

For the last 90 days, production audit events for resource_type DETAINEE show:

- DEITANEE_INSERT / SUCCESS: 14
- DEITANEE_UPDATE / SUCCESS: 4

All inspected recent inserts carry actor_user_id, request_id, correlation_id, and transactionBoundary = P9.7-DURABLE-v1.

No source or origin metadata was present in the inspected rows.

This is positive evidence that the observed recent detainee mutations were durably audited through the canonical transaction boundary. It does not prove that historical manual/import procedures never existed.

## Import/manual closure matrix

| Surface | Evidence | Status |
|---|---|---|
| Dedicated CSV/XLSX detainee importer | none identified | CLOSED / not established |
| Spreadsheet/manual loader | none identified in repository | UNVERIFIED outside repository |
| Production UI manual create | present | ACTIVE |
| Direct authenticated table DML | removed | CLOSED |
| Direct movement SECURITY DEFINER execution | removed | CLOSED |
| Generic privileged mutation | service-role canonical boundary | CLOSED |
| Backup restore | controlled recovery path, not import | X5 |
| External/manual operator procedure | no repository evidence | UNVERIFIED |

## Legacy-code implication

The absence of a repository import pipeline does not establish that the temporary legacy code CREATE compatibility can be removed.

The existing production create contract still accepts caller-supplied code, and the authoritative external source of those values has not been established.

Therefore no legacy-code generator is invented, no CREATE compatibility is removed, no code column migration is performed, and G1 remains blocked.

## Required closure evidence

X2 can only be considered fully closed when an operational owner/process review establishes whether any production procedure outside the repository can create a detainee, supply a legacy code, bypass mta-api, perform bulk/import creation, or restore records through an operator-controlled process.

If such a procedure exists, its provenance and canonical boundary must be documented before closure.

## Decision

G1-X2 = PARTIALLY CLOSED / EXTERNAL PROCEDURE UNVERIFIED.

Repository evidence does not show a separate importer or manual loader. Production telemetry supports canonical recent mutations. However, repository inspection cannot prove absence of undocumented operator spreadsheets, scripts, ETL jobs, or external procedures.

## Next gate

Proceed to G1-X3 External Integration Closure while retaining the X2 external-procedure evidence gap.

G1-X5 Recovery Operator Closure remains separate.

G2 Legacy Code replacement remains blocked.
