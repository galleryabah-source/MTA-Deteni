# Legacy Detainee `code` Second Consumer / Provenance Scan V1

## 1. Purpose

This scan is the second forensic pass after the NID-first read/presentation migration in PR #294.

The purpose is to determine whether any detainee `code` consumer exists outside the reviewed compatibility inventory and to classify the remaining consumers by retirement risk.

This scan does **not** authorize physical retirement of `public.mta_detainees.code`.

## 2. Scan boundary

Repository:
- `galleryabah-source/MTA-Deteni`

Reviewed head:
- `hardening/legacy-code-nid-read-v1`
- `c0949c18f8f1bf88adcf66ab4acf3cd780ed8a09`

Base:
- `main`
- `629fcee8d2d1f91b9d9a20a5fed8e5883e75bc9e`

Primary evidence:
- `docs/LEGACY_DETAINEE_CODE_CONSUMER_PROVENANCE_AUDIT_V1.md`
- `docs/LEGACY_DETAINEE_CODE_NID_MIGRATION_BOUNDARY_V1.md`
- `test/legacy-detainee-code-boundary.test.mjs`
- PR #294 NID-first read/presentation changes

## 3. Scan result

### Overall

**SECOND SCAN: PASS WITH RETIREMENT BLOCKERS**

The repository-level boundary test inventory remains closed: no new detainee `code` consumer was identified outside the declared transitional inventory.

However, the existing consumers are not yet all read-only. Several remain active write or recovery dependencies.

Therefore:

```
New consumer outside inventory        = NOT FOUND
Legacy write dependency               = PRESENT
Legacy recovery dependency            = PRESENT
Legacy presentation fallback          = PRESENT
Physical retirement                   = BLOCKED
```

## 4. Consumer classification

| Consumer | Current role | Classification | Retirement status |
|---|---|---|---|
| `web/mta-domain-commands-v1.js` | create/update accepts and mutates `code` | WRITE DEPENDENCY | BLOCKER |
| `web/mta-domain-commands-v2.js` | canonical command delegates detainee mutation | WRITE BOUNDARY | BLOCKER |
| `web/mta-production-state-adapter-v1.js` | reads and writes `code` to production | PRODUCTION WRITE DEPENDENCY | BLOCKER |
| `web/mta-app-runtime-full.js` | create/edit input still sends `code` | UI WRITE DEPENDENCY | BLOCKER |
| `supabase/functions/mta-api/index.ts` | generic detainee POST/PATCH does not reject `code` | API WRITE COMPATIBILITY | BLOCKER |
| `web/detainee-detail-v1.js` | NID-first with legacy fallback | READ FALLBACK | TRANSITIONAL |
| `web/detainee-statistics-v1.js` | NID-first presentation | READ/PRESENTATION | TRANSITIONAL |
| `web/data-statistics-report-v1.js` | NID-first report value with fallback | REPORT FALLBACK | TRANSITIONAL |
| `web/qr-print-clean.js` | NID-first displayed identity with fallback | PRESENTATION FALLBACK | TRANSITIONAL |
| `web/qr-print-clean-v2.js` | NID-first displayed identity with fallback | PRESENTATION FALLBACK | TRANSITIONAL |
| `web/movement-v9.js` | UUID relationship; legacy-derived display compatibility remains | PROVENANCE TRANSITION | TRANSITIONAL |
| backup GET | `select("*")` includes legacy `code` | RECOVERY/PROVENANCE | BLOCKER |
| backup restore | accepts complete detainee payload through restore transaction | RECOVERY DEPENDENCY | BLOCKER |

## 5. Important findings

### 5.1 NID-first read migration is effective

The migrated surfaces now prefer:

```
nid → code → id
```

for compatibility presentation.

This establishes NID as the first operational identity without requiring an unsafe simultaneous removal of the legacy field.

### 5.2 Domain write dependency remains

The detainee domain commands still accept `options.code` / `o.code`, validate uniqueness, and persist it.

This means the current domain contract is not yet NID-only.

### 5.3 Production adapter remains a legacy write boundary

The production adapter still destructures `code`, requires it for detainee mutation, and sends it to the production API/database.

This is the principal application-to-production compatibility dependency.

### 5.4 UI still exposes legacy code as an input

The create/edit form explicitly labels the field:

```
Kode Legacy (compatibility)
```

but it is still a required input and is passed into the canonical detainee command.

This is intentional at the current boundary and must not be mistaken for retirement.

### 5.5 Generic API still accepts legacy code

The detainee-specific API boundary rejects caller-supplied NID and enforces `entry_year`, but it does not yet reject caller-supplied `code`.

Therefore a direct generic POST/PATCH remains a legacy write surface.

### 5.6 Backup/restore remains code-bearing

The backup endpoint reads complete detainee rows with `select("*")`, so `code` is present in backup payloads.

Restore accepts the version-1 payload and passes detainee data to the canonical restore transaction.

Backup schema/version semantics must be migrated before physical removal of `code`.

### 5.7 No new consumer detected

The boundary test scans executable repository files for known detainee-code patterns and requires every discovered consumer to be present in the declared inventory.

The current inventory remains closed.

This is evidence of repository boundary control, not proof of zero external consumers.

## 6. External integration status

The repository/catalog review does **not** prove that external systems have zero dependency on `code`.

Therefore:

```
External dependency = UNPROVEN
```

No external integration may be declared retired solely from this repository scan.

## 7. Retirement decision

Physical retirement remains blocked.

The safe sequence is:

```
NID canonical
   ↓
NID-first reads/presentation
   ↓
freeze new code consumers
   ↓
remove code from domain write contract
   ↓
remove code from production adapter write payload
   ↓
API rejects new code writes
   ↓
version backup/restore without code
   ↓
second provenance scan
   ↓
prove external dependency = zero
   ↓
compatibility window
   ↓
drop UNIQUE(code)
   ↓
drop code column
```

## 8. Next engineering gate

The next implementation gate is **Legacy Write Boundary V1**.

Scope:

1. define the compatibility-write strategy;
2. stop new domain callers from introducing fresh `code` values;
3. preserve existing production `code` values for compatibility;
4. establish whether `code` is frozen, generated only by a controlled migration path, or otherwise compatibility-managed;
5. then remove `code` from normal domain create/update contracts;
6. only after that migrate the production adapter and generic API.

No production column drop is part of this gate.

## 9. Certification statement

The second consumer/provenance scan confirms that PR #294 did not create an uncontrolled second identity path.

NID remains the canonical operational identity.

Legacy `code` remains an explicitly bounded compatibility field with active write and recovery dependencies.

**RETIREMENT: NOT READY.**
