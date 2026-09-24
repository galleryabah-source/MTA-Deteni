# Phase 11 — Core Operational Journey Integration

## Scope
Harden the first operational chain without changing database schema or activating production persistence:

`Data Deteni → Penempatan → Pergerakan → Izin → Audit`

## Controls implemented
- Data Deteni no longer accepts free-text placement during create/edit; placement is governed by the Penempatan surface.
- Detainee code uniqueness is enforced before mutation.
- Penempatan selection is sourced from active Master Kamar.
- Placement capacity and room state are validated before mutation.
- Placement mutation carries an idempotency/request key and updates the detainee placement projection.
- Izin creation requires an active detainee and carries an idempotency/request key.
- Existing leave state-machine validation remains the transition boundary.
- Pergerakan remains governed by active Master Kamar, capacity, detainee status, request key, placement mutation, and audit evidence.
- A browser-visible `mtaCoreJourneyContractTest()` was added for the shared synthetic state.

## Runtime model
All changes remain on the existing synthetic browser state:
- `localStorage` key: `mta-deteni-demo-v2`
- shared mutation event: `mta:data-changed`
- IndexedDB offline queue remains separate and synthetic-only.

## Governance
- Migration freeze: **ON**
- Database schema changes: **NONE**
- Production detainee data: **NOT USED**
- AI runtime: **OFF**
- Production persistence: **NOT ENABLED**

## Evidence gate
Phase 11 source contracts are implemented. Browser interaction evidence must still be collected after deployment for:
1. Data Deteni create/edit
2. Penempatan from Master Kamar
3. Pergerakan
4. Izin state transition
5. Audit reflection
6. Monitor/report reflection

Source contracts alone are not treated as browser-runtime certification.
