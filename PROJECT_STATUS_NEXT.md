# MTA DETENI — Next Gate

**Foundation:** v1.122+
**Current:** F4 — Daily Guard Report lifecycle integrity hardening; F4 domain/runtime gates CI-verified on head `90f81cdb...`

## Completed (through current gate)

- Deterministic reconnect, reporting, persistence, authorization and offline/local continuity foundations.
- P13.13681–13800: post-dispatch acknowledgement bound to exact execution, dispatch, evidence, decision, request and fingerprint identities.
- P13.13801–14040: acknowledgement replay and continuity certification.
- P13.14041–14400: completion proof, continuity receipt and runtime closure gate.
- P13.14401–15000: integrated recovery closure, replay, evidence and final closure certification.
- P13.15001–15360: final closure audit record, replay and integrated certification.
- P13.15361–15720: final closure audit evidence envelope, replay guard and certification.
- P13.15721–16080: operational audit projection boundary, replay guard and integrated certification.
- P13.16081–16200: deterministic operational audit publication envelope with explicit READY_FOR_PUBLICATION state and no external publication.
- P13.16201–16320: deterministic publication replay guard with ADMIT/REPLAY/CONFLICT semantics and no external side effect.
- P13.16321–16440: integrated publication certification composes readiness and replay boundaries and preserves exact identity/fingerprint continuity.
- F3: operational actions closure — movement/placement/leave/QR state actions, token-resource binding, return lifecycle, audit/event continuity; CI-verified.
- F4: Daily Guard Report lifecycle — DRAFT → VALIDATED → GENERATED → IN_REVIEW → APPROVED / CHANGES_REQUESTED → REVISION → FINAL → VERIFY_INTEGRITY → DOWNLOAD; revision lineage, actor/context metadata, final artifact binding, SHA-256 integrity, final immutability, and audit events implemented.
- F4 runtime coverage: full browser adapter execution plus lifecycle validation after VERIFY_INTEGRITY and DOWNLOAD events; failed integrity verification is retained as an auditable event.
- F4 latest Domain CI run #1662: SUCCESS; P1 Runtime Observation run #365: SUCCESS.

## Parallel UI hardening — smartphone & tablet

Implemented without changing the database/migration boundary:

- Smartphone/tablet shell at <=1024px replaces the cramped left sidebar with a full-width content surface and fixed bottom navigation.
- Central **Scan QR** action is intentionally larger than neighboring actions and delegates to the existing adaptive QR camera runtime.
- `Laporan` maps to the existing `documents` view instead of introducing a parallel route.
- Mobile detainee table is projected into responsive cards while preserving the existing row actions and underlying synthetic data.
- Safe-area handling and bottom content padding prevent gesture bars and the fixed navigation from covering content.
- Mobile search keeps the card projection synchronized without a mutation-observer feedback loop.
- Service Worker shell cache now includes the mobile shell.
- Device regression contract covers phone 390x844, tablet 768x1024, and desktop 1440x900.
- UI contract is documented in `docs/17-mobile-tablet-ui-hardening.md`.

## Deployment observation

Cloudflare deployment is still blocked at the credential/permission boundary. The latest controlled deploy reached Cloudflare API authentication and returned error code 10000; the account token is accepted as an account token but lacks the permission required to update the target Worker service. No production access was attempted.

## Functional next gate: F4 closure → next functional journey

F4 is functionally and CI verified on the current head. PR #146 remains open and intentionally unmerged. Before merge, retain synthetic-only governance and perform final PR review.

## Next gate: P13.16441–16560

Define a deterministic, synthetic-only publication request admission contract over certified publication readiness. Preserve the complete projection/certification/publication identity chain, reject drift/conflict/incomplete/non-synthetic state, and remain strictly before external transport or durable publication.

## Governance lock

Migration Freeze TRUE. AI OFF. Repository SYNTHETIC ONLY. Production access NOT AUTHORIZED. Live PostgreSQL execution BLOCKED pending explicit governance clearance and approved non-production target.

## Observation blocker

GitHub Actions remains an observation blocker for the full domain gate. New commits must not be described as CI-PASS until observable workflow steps/logs/artifacts exist. The dedicated responsive device workflow has produced successful phone/tablet/desktop smoke evidence for the earlier responsive-shell revision; the newest shell hardening revision is awaiting its current workflow run.
