# MTA DETENI — Project Status

**Version:** Foundation v1.61
**Current Phase:** P13.5241–5360 audit hardening → execution-backed convergence
**Implementation Track:** P13.5361–5440
**Branch:** `phase-p12.961-13.200`

## Latest Progress

- P13.5241–5280 — observed-evidence integrity hardened with SHA-256 over canonical evidence payload;
- P13.5281–5320 — disaster-recovery rehearsal evidence hardened with backup/restore identities, hashes, replay/rebuild verification and human sign-off;
- P13.5321–5360 — canonical domain vocabulary hardened to `RAP`, `PERKES`, `KAMTIB`, `SUBBAG_TU`, `HEAD_RUDENIM`; `LEADERSHIP` remains compatibility input only;
- regression tests and audit-hardening documentation added;
- PROJECT_STATUS synchronized with the actual post-audit state.

## Current Gate

**P13.5360 — AUDIT HARDENING COMPLETE / EXECUTION EVIDENCE REQUIRED**

The highest-value contract-level audit findings have been corrected. The next work is intentionally execution-first rather than adding speculative architecture: run the existing controlled non-production matrix, capture real observations, fix observed defects, retest, and certify only from observed evidence.

## Execution Blocker Observed

GitHub Actions was triggered for the latest hardening commits, but the `domain-ci` job failed before producing usable step-level execution evidence. Run #262 for commit `1a45fd23ace1d88e65efb0fafcab6b0b75f0fc3b` completed in approximately two seconds with `failure`, and the job exposed no executable step log through the available GitHub integration. This is treated as an **execution infrastructure blocker**, not as a test PASS and not as proof of an application defect.

The workflow definition itself remains the intended contract: checkout → Node 24 → dependency installation → typecheck → JavaScript tests → TypeScript domain tests.

## Next Checkpoints — P13.5361–5440

1. Restore/obtain a functioning controlled execution runner and obtain step-level CI evidence.
2. Run `npm run typecheck`.
3. Run `npm test`.
4. Run `npm run test:unit`.
5. Execute the controlled non-production application harness.
6. Execute role journeys for RAP, PERKES, KAMTIB, SUBBAG_TU and HEAD_RUDENIM.
7. Execute PC/LAN/tablet/smartphone continuity and offline/online reconciliation.
8. Render and visually review the approved Daily Guard Report against the approved source template.
9. Execute backup/restore rehearsal with real evidence identities and hashes.
10. Execute security regression and aggregate only observed evidence.

## Integrated Application Model

RAP owns registration, administration and reporting; PERKES owns health records and health workflows; KAMTIB owns placement, movement, headcount, temporary exit, escort and operational QR; SUBBAG TU owns escort document administration; HEAD RUDENIM has oversight, read-only operational visibility and authority for petunjuk, arahan, rekomendasi and disposisi without direct operational editing.

## Safety / Governance

- Migration Freeze: **TRUE**;
- AI: **OFF**;
- Repository data: **SYNTHETIC ONLY**;
- Production access: **NOT AUTHORIZED**;
- Live PostgreSQL execution: **BLOCKED until explicit governance clearance and an approved non-production target**;
- No schema migration introduced;
- No real detainee data, credentials, health records, WhatsApp exports or production PII in GitHub;
- No autonomous AI decision-making;
- No direct WhatsApp/OCR/transcript → approved operational record;
- No fabricated execution evidence.

## Design Integrity

- Temporary-exit remains distinct from deportation.
- QR remains contextual operational verification and is not a free-form data-entry path.
- Leadership remains oversight/directive only and cannot directly mutate operational data.
- Offline operation never creates authority.
- Sync conflicts require human review.
- Report artifacts require deterministic inputs and reconciled source bindings.
- Exact visual report reproduction remains gated by approved source-template evidence and observable rendering review.
- `NOT_RUN` never becomes PASS.
- Unexpected evidence/control identities are rejected.
- Production deployment remains blocked without explicit authorization.
