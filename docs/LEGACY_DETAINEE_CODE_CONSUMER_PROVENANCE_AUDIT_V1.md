# Legacy Detainee `code` Consumer / Provenance Audit V1

Date: 2026-10-02

## Scope

This audit determines whether `public.mta_detainees.code` can be physically retired after canonical NID certification.

Scope:
- application/domain consumers;
- production adapter/API consumers;
- UI/detail/statistics/report/QR consumers;
- transactional and operational references;
- backup/restore provenance;
- production database constraints, views, functions and triggers;
- external integration evidence available from the repository and production database.

This audit does **not** remove, rename, or mutate the legacy column.

## Canonical identity boundary

Canonical operational identity:

`RDM-PTK-YY-NNNNNN`

`public.mta_detainees.nid` is authoritative for operational detainee identity.

`public.mta_detainees.code` remains a legacy field.

## Executive result

**RETIREMENT NOT READY.**

The legacy `code` field still has active application consumers and at least one active production write dependency.

The strongest blocking dependency is:

```
UI / domain create-update
        ↓
code
        ↓
production state adapter
        ↓
mta_detainees.code
```

The generic production API also currently permits `code` to remain in detainee mutation payloads because the detainee-specific boundary rejects `nid` but does not reject `code`.

Therefore the current safe decision is:

```
NID          = CANONICAL
code         = ACTIVE LEGACY COMPATIBILITY FIELD
physical DROP = BLOCKED
```

## Consumer inventory

### C-01 — Domain create/update

Files:
- `web/mta-domain-commands-v1.js`
- `web/mta-domain-commands-v2.js`

Observed behavior:
- create accepts `options.code`;
- create checks duplicate `code`;
- create persists `code`;
- update accepts `options.code`;
- update checks duplicate `code`;
- update mutates `code`.

Classification: **ACTIVE WRITE CONSUMER — BLOCKER**

This is not merely compatibility read behavior. The application domain currently treats `code` as a mutable detainee field.

### C-02 — Production state adapter

File:
- `web/mta-production-state-adapter-v1.js`

Observed behavior:
- production detainee mapping reads `d.code`;
- production create/update destructures `code`;
- production mutation payload contains `code`;
- create/update validation requires `code`.

Classification: **ACTIVE PRODUCTION WRITE/READ CONSUMER — BLOCKER**

### C-03 — Main detainee runtime/UI

File:
- `web/mta-app-runtime-full.js`

Observed behavior:
- synthetic detainee records contain `code`;
- detainee list renders `code`;
- search UI is described as searching code/name;
- create/edit form exposes `Kode`;
- create/update commands receive `code`;
- placement, movement and leave selectors display `d.code`.

Classification: **ACTIVE UI/RUNTIME CONSUMER — BLOCKER**

The synthetic runtime is also a compatibility surface and cannot be treated as production-schema-independent.

### C-04 — Detainee detail / document export

File:
- `web/detainee-detail-v1.js`

Observed behavior:
- document title/subtitle uses `d.code`;
- printed identity table labels `Kode`;
- downloadable document filename incorporates `d.code`;
- detail identity fields expose `Kode`.

Classification: **ACTIVE REPORT/DOCUMENT CONSUMER — BLOCKER**

### C-05 — Detainee statistics

File:
- `web/detainee-statistics-v1.js`

Observed behavior:
- enriched detainee rows include `code`;
- statistics/report detail rows output `Kode`.

Classification: **ACTIVE REPORT CONSUMER — BLOCKER**

### C-06 — Data statistics report

File:
- `web/data-statistics-report-v1.js`

Observed behavior:
- detainee enrichment derives `code`;
- report rows expose `Kode`.

Classification: **ACTIVE REPORT CONSUMER — BLOCKER**

### C-07 — QR print compatibility

Files:
- `web/qr-print-clean.js`
- `web/qr-print-clean-v2.js`

Observed behavior:
- detainee QR labels use `x.code`.

Classification: **ACTIVE PRESENTATION/PRINT CONSUMER — BLOCKER**

The audit did not establish that the QR token itself uses `code`; the observed dependency is the displayed/printed label.

### C-08 — Movement presentation

File:
- `web/movement-v9.js`

Observed behavior:
- movement rows use `m.detaineeCode`;
- detainee selectors display `x.code`.

Classification: **ACTIVE LEGACY-DERIVED PRESENTATION CONSUMER**

This requires provenance tracing before retirement because `detaineeCode` may be a denormalized legacy compatibility value.

### C-09 — Generic production API

File:
- `supabase/functions/mta-api/index.ts`

Observed behavior:
- GET on `detainees` uses `select("*")`, so `code` is exposed in the returned row;
- POST/PATCH detainee requests reject caller-supplied `nid`, but there is currently no corresponding `code` rejection;
- generic mutation payload is forwarded through the idempotent mutation boundary.

Classification: **ACTIVE API COMPATIBILITY CONSUMER + WRITE SURFACE — BLOCKER**

This is the most important server-side retirement finding.

### C-10 — Backup / restore

File:
- `supabase/functions/mta-api/index.ts`

Observed behavior:
- backup reads `select("*")` from `mta_detainees`;
- backup payload therefore contains `code`;
- restore accepts the complete detainee payload through the backup transaction boundary.

Classification: **ACTIVE PROVENANCE / RECOVERY CONSUMER — BLOCKER**

Retirement cannot occur until backup schema/version semantics explicitly replace legacy `code`.

## Production database audit

Production `public.mta_detainees` currently has:

- `code`: NOT NULL;
- `entry_year`: NOT NULL;
- `nid`: NOT NULL.

Constraints:
- `mta_detainees_code_key`: UNIQUE(code);
- `mta_detainees_nid_key`: UNIQUE(nid);
- canonical NID format check;
- entry-year range check;
- UUID primary key.

Indexes therefore still enforce legacy `code` uniqueness.

Classification: **DATABASE COMPATIBILITY CONTRACT — BLOCKER**

## Database routine/view inspection

Production catalog inspection did not identify a view/materialized view or function directly consuming `mta_detainees.code` as a detainee identity field.

The transactional movement function uses detainee UUID identity and does not require `code` for its canonical transaction boundary.

The NID generator is independent of `code`.

Classification: **NO DIRECT DATABASE ROUTINE BLOCKER IDENTIFIED**

This does not prove absence of consumers outside the inspected repository/database catalog.

## Cross-section provenance

The operational movement transaction uses:

`detainee_id → mta_detainees.id`

and not `code`.

This supports the canonical identity direction:

```
UUID technical PK
      ↓
canonical NID
      ↓
detainee_id references
      ↓
RAP / Perkes / Kamtib
```

No evidence was found in the inspected production schema of a second section-specific detainee identity.

## External integration boundary

Repository and production-catalog inspection did not establish an external integration that explicitly consumes `code`.

However, absence from the inspected source does **not** prove that no external consumer exists.

Therefore external integration status is:

**UNVERIFIED — requires operational/integration inventory before physical column retirement.**

## Retirement blockers

Current blockers:

1. Domain create/update still accepts and mutates `code`.
2. Production state adapter still requires and writes `code`.
3. Main detainee UI still exposes `Kode`.
4. Detainee detail/document output still exposes `code`.
5. Statistics/report output still exposes `code`.
6. QR print output still uses `code` as a detainee label.
7. Movement UI still displays `code` / `detaineeCode`.
8. Generic detainee API still exposes `code` through `select("*")`.
9. Generic detainee POST/PATCH does not yet reject legacy `code`.
10. Backup/restore payload still carries `code`.
11. Production database still enforces UNIQUE(code) and NOT NULL(code).
12. External integration dependency has not been independently certified as zero.

## Safe retirement sequence

Do **not** drop `code` now.

Required sequence:

```
AUDIT COMPLETE
     ↓
introduce NID-first read model
     ↓
migrate UI/report/document/QR consumers
     ↓
remove code from new domain write contracts
     ↓
remove code from production adapter writes
     ↓
make API explicitly NID-first and reject new code writes
     ↓
version backup/restore contract
     ↓
prove zero runtime code consumers
     ↓
prove external integration dependency = zero
     ↓
legacy code compatibility window
     ↓
retirement migration
     ↓
DROP UNIQUE(code)
     ↓
DROP column code
```

## Current gate

```
NID canonical identity              PASS
Legacy consumer inventory            COMPLETE (repository/database scope)
Active legacy consumers              FOUND
Production write dependency         FOUND
Backup/recovery dependency           FOUND
External integration dependency      UNVERIFIED
Physical code retirement             BLOCKED
```

## Recommendation

The next engineering work should be a **Legacy Code → NID Migration Boundary**, not a schema drop.

That boundary should first:
1. make NID the only new operational identity contract;
2. preserve `code` as read-only compatibility data;
3. remove `code` from new detainee create/update domain commands;
4. change production adapter writes to NID/UUID semantics;
5. replace UI/report/QR presentation dependencies with NID;
6. version backup/restore before removing `code`;
7. add CI detection preventing new detainee `code` consumers.

Only after those gates are green should a physical retirement migration be considered.


## Post-audit CI inventory reconciliation

The legacy-code boundary guard was run again after the privileged credential audit branch was created. The guard identified six repository consumers that were not present in the original static inventory:

- tests/authenticated-browser-acceptance.mjs
- web/admin-settings-v8.js
- web/mta-unified-shell-v1.js
- web/mta-unified-shell-v2.js
- web/preview-v5.js
- web/preview-v6.js

These are now explicitly recorded in the compatibility inventory.

Classification note:
- tests/authenticated-browser-acceptance.mjs is a synthetic browser acceptance fixture and contains synthetic detainee records;
- admin-settings-v8.js, mta-unified-shell-v1.js, mta-unified-shell-v2.js, preview-v5.js and preview-v6.js are runtime/synthetic compatibility surfaces that still reference the legacy field in their current repository state.

This discovery does not change the retirement decision. It strengthens the requirement that zero-consumer proof must include tests, synthetic runtime layers, previews, and compatibility surfaces, not only production-facing modules.

The CI guard failure was therefore treated as inventory drift, not suppressed or bypassed.
