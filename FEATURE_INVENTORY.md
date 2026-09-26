# MTA DETENI — FEATURE INVENTORY & CAPABILITY AUDIT

Tanggal audit: 2026-09-26  
Repository: galleryabah-source/MTA-Deteni  
Branch: main  
Head yang diaudit: 76a3ceddeff612d1670d96173beaabdd41562c09

## Tujuan

Inventory ini memetakan capability yang terdeteksi dari source, commit history, test suite, dan dokumentasi. \`FEATURE_REGISTRY.md\` tetap menjadi single source of truth untuk Feature ID; inventory ini menjadi peta capability yang lebih luas.

## Status Evidence

- VERIFIED — implementasi + test/CI + runtime relevan tersedia.
- IMPLEMENTED — implementasi dan contract/test tersedia, runtime feature-specific belum lengkap.
- HARDENED — capability diperkuat melalui remediation/regression.
- CONTRACT READY — contract/scaffold tersedia, implementasi operasional penuh belum boleh diasumsikan.
- LOCKED / ROADMAP — konsep dikunci, belum implemented.
- GOVERNANCE BLOCKED — sengaja dibatasi oleh migration/production/AI/synthetic boundary.
- UNREGISTERED — capability ada tetapi belum memiliki Feature ID.

## Feature Inventory

| # | Feature / Capability | Module | Representative Commit | Phase / Track | Status | Test Evidence | Runtime Evidence | Feature ID |
|---:|---|---|---|---|---|---|---|---|
| 1 | Feature Registry & Verification Tracking | Governance | a8adf931 / c73e10ce | Governance | VERIFIED | registry contract | repository evidence | MTA-F-20260926-001 |
| 2 | Detail Data Deteni + Histori + QR + Dokumen | Data Deteni | e12c9ea9 / c73e10ce | Feature track | IMPLEMENTED | detainee-detail-feature.test.mjs | Static Integration Gate PASS; browser/runtime pending | MTA-F-20260926-002 |
| 3 | Immutable Canonical QR Deteni | QR Identity | cfcc10b7 / 12179daa | F5 / QR integrity | HARDENED | immutable QR contract | runtime feature verification pending | MTA-F-20260926-002 |
| 4 | Statistik Data Deteni & Ekosistem | Statistics | b54ae876 / 105552fe | Feature track | IMPLEMENTED | detainee-statistics-feature.test.mjs | runtime verification pending | MTA-F-20260926-003 |
| 5 | Tabel Statistik + Download + Print A4 | Statistics/Reporting | 105552fe / 76a3cedd | Feature track | IMPLEMENTED | export/print regression | browser/runtime pending | MTA-F-20260926-003 |
| 6 | Data Deteni CRUD + ownership/placement integrity | Core Administration | 46b3528e | P10/P12 + F5 | HARDENED / UNREGISTERED | domain/integration regression | synthetic runtime; production DB blocked | UNREGISTERED |
| 7 | Placement Block / Room / Bed | Placement | e0228ca4 / 3f87faaa | P10 / F5.3 | HARDENED / UNREGISTERED | placement/cross-domain contracts | synthetic runtime; live DB blocked | UNREGISTERED |
| 8 | Room Master Governance / Occupied Room Guard | Master Room | 3f87faaa / 46702d4e | F5.3 / UI | HARDENED / UNREGISTERED | room integrity + mobile regression | device/synthetic evidence | UNREGISTERED |
| 9 | Movement Operational Actions | Movement | 8728e0da / 21c3dc15 | F3 / F5 | HARDENED / UNREGISTERED | f3-operational-actions + movement contracts | browser journey evidence | UNREGISTERED |
| 10 | Headcount + Movement Consistency | Movement/Headcount | 22f2828d / bd178a17 | P10/P11 | CONTRACT/IMPLEMENTED | P11 operational consistency tests | synthetic-only | UNREGISTERED |
| 11 | Temporary Exit / Izin Keluar | Leave | 7206de11 / 8d5fc94d | F3 / P11 | IMPLEMENTED / UNREGISTERED | f3-leave-return + DOM/browser tests | synthetic browser evidence | UNREGISTERED |
| 12 | Escort / Pengawalan Service | Escort | 8d9cb968 / 31af8925 | P10 | CONTRACT/IMPLEMENTED | P10 escort service contracts | live operational execution gated | UNREGISTERED |
| 13 | QR Camera Scanner v2 | QR Camera | 8b52104d / 92c4b284 | F0-F1 | HARDENED / UNREGISTERED | qr-camera-integration + device tests | device smoke evidence; latest runtime recheck needed | UNREGISTERED |
| 14 | QR Resolve → Data → Action | QR/Operational Action | 42e6ee97 / 4b648320 | F1-F3 | HARDENED / UNREGISTERED | QR resolve/action tests | browser/device journey evidence | UNREGISTERED |
| 15 | QR Print / Download Clean Output | QR Documents | qr-print-clean-v3 lineage | F3/F5 | IMPLEMENTED / regression-sensitive | QR/browser regression coverage | clean-print path exists; must remain runtime-verified | UNREGISTERED |
| 16 | Daily Guard Report Renderer | Reporting | d3e0fb7c / d957a0d6 | D5 / F4 | IMPLEMENTED | daily-guard + F4 browser tests | browser report evidence | UNREGISTERED |
| 17 | Daily Guard Report Lifecycle / Approval | Reporting Workflow | D5.7 lineage | D5 | IMPLEMENTED | lifecycle + retrieval/revision tests | synthetic runtime; storage/PDF gated | UNREGISTERED |
| 18 | MFE Evidence → Daily Dataset → Report | Mobile Evidence/Reporting | f4b13cbc / 292e5f3f / ed5b591d | D5 | IMPLEMENTED / HARDENED | mfe-canonical-daily-report-runtime | actual MFE queue → renderer evidence | UNREGISTERED |
| 19 | Mobile Field Evidence Intake Adapter | Mobile/Evidence | f4ac23dc | Mobile roadmap | IMPLEMENTED ADAPTER | MFE runtime tests | controlled/synthetic; production data blocked | UNREGISTERED |
| 20 | Admin Settings — AI API + Web Branding | Admin | 1f9a861a / 1b9cd1ff | Admin hardening | IMPLEMENTED / UNREGISTERED | settings-navigation regression | loader/navigation hardening; AI OFF | UNREGISTERED |
| 21 | Branding Upload / Operational-State Isolation | Admin/Storage | 36a500a6 / 79ab9f8a | Admin hardening | HARDENED | settings/data regression | synthetic runtime | UNREGISTERED |
| 22 | Authentication + Session Hydration | Auth | c68223b8 / 67aa69ba | P9/P12 | HARDENED / UNREGISTERED | production-auth-rbac + auth regressions | controlled runtime; production governed | UNREGISTERED |
| 23 | Production Auth/RBAC + CRUD API Adapter | Auth/API | 8c55de41 | P12 | IMPLEMENTED / GOVERNANCE BLOCKED | production-auth-rbac-api.test.mjs | adapter exists; live DB blocked | UNREGISTERED |
| 24 | RBAC / Authorization Adversarial Boundary | Security | f64021d0 / de674e17 | P9/P12 | HARDENED | authorization-adversarial-certification | non-production evidence | UNREGISTERED |
| 25 | State Kernel / Canonical State Contract | Runtime Core | 39c85eb3 / d12eb7ec | P9 / F5 | HARDENED | state-machine/kernel tests | synthetic runtime | UNREGISTERED |
| 26 | Unified Shell / Navigation | UI Runtime | 4959c96b / 7ffa110a | P1/UI | HARDENED | navigation/device smoke tests | device smoke evidence | UNREGISTERED |
| 27 | Desktop Shell | UI | eb1f4d7a / 4c260ece | UI hardening | HARDENED | device/UI regression | desktop responsive evidence | UNREGISTERED |
| 28 | Mobile / Tablet Shell + Bottom Navigation | UI | 8a971cb1 / 46702d4e | UI hardening | HARDENED | mobile-modal + responsive tests | phone/tablet/desktop smoke evidence | UNREGISTERED |
| 29 | Responsive Data Deteni Projection | UI/Data | 5a148a9d / b61b6c2f | UI hardening | HARDENED | responsive/device tests | device smoke evidence | UNREGISTERED |
| 30 | Offline Queue / Reconciliation | Offline Runtime | f1eed7d3 / a7f24c12 | F5.2 / P13 | IMPLEMENTED / HARDENED | local-runtime-offline + P13 tests | controlled-nonprod recovery evidence | UNREGISTERED |
| 31 | Offline Runtime Shell / Service Worker | Offline UI | 875ee71a / 6417f495 | P13 | HARDENED | offline/device suite | controlled synthetic evidence | UNREGISTERED |
| 32 | Local Runtime Adapter / Session Continuity | Local Runtime | P13.10081+ lineage | P13 | CONTRACT/IMPLEMENTED | local adapter/session tests | controlled-nonprod; physical LAN gate remains | UNREGISTERED |
| 33 | Audit Trail / State-Kernel Routing | Audit | 39b98ede / 25a2d496 / 8d5fc94d | F5 / P9 | HARDENED | audit-integrity/domain audit tests | synthetic evidence | UNREGISTERED |
| 34 | Audit Tamper-Evidence Verifier | Audit/Evidence | f7c92de4 / bb3a5e94 / d877b511 | F5 / P9 | IMPLEMENTED / HARDENED | audit-tamper-evidence.test.ts | controlled evidence | UNREGISTERED |
| 35 | Evidence / MFE Evidence Runtime | Evidence | f4b13cbc / c61e3578 | P13 / D5 | IMPLEMENTED | MFE canonical runtime test | runtime queue evidence | UNREGISTERED |
| 36 | Backup / Restore / Disaster Recovery | Recovery | 284ac6b9 / e86bb0e4 | P13 | IMPLEMENTED / HARDENED | backup-restore-dr-certification + P13 recovery tests | CI evidence artifact uploaded | UNREGISTERED |
| 37 | Observability / Context Continuity | Runtime Governance | P1/P9 lineage | P1 / P9 | VERIFIED AT CONTRACT/EVIDENCE LEVEL | observability/context tests | P1 controlled-nonprod OBSERVED_PASS | UNREGISTERED |
| 38 | Transaction / Idempotency / Optimistic Concurrency | Runtime Core | P1/P9 lineage | P1/P9 | VERIFIED AT CONTRACT/EVIDENCE LEVEL | transaction-idempotency + concurrency + mutation tests | controlled-nonprod evidence | UNREGISTERED |
| 39 | Canonical Outbox | Runtime Core | P1/P9 lineage | P9/P1 | VERIFIED AT CONTRACT/EVIDENCE LEVEL | outbox + P1 tests | controlled-nonprod evidence | UNREGISTERED |
| 40 | Cloudflare Runtime Health / Governance Boundary | Deployment | governance remediation lineage | Deployment/P1 | IMPLEMENTED / DEPLOYMENT BOUNDARY | cloudflare-health-governance.test.mjs | earlier production health verified; latest correction requires redeploy | UNREGISTERED |
| 41 | Cloudflare CI / Staging / Preview Pipeline | CI/CD | workflow lineage | CI/CD | IMPLEMENTED / HARDENED | domain/integration/device workflows | controlled workflow evidence | UNREGISTERED |
| 42 | AI Failure Resilience / AI-OFF Deterministic Fallback | AI Governance | AI continuity lineage | AI/D5 | IMPLEMENTED CONTRACT / GOVERNANCE BLOCKED | ai-gateway-resilience + ai-off fallback + provider failure tests | AI OFF; deterministic path protected | UNREGISTERED |
| 43 | AI Document Template Intelligence & Replication | AI/Documents | 1ba2eb92 / 0e57cdd0 | Roadmap | LOCKED / ROADMAP | design/roadmap docs only | AI OFF; not operationally verified | UNREGISTERED |
| 44 | Mobile Field Evidence → Daily Report Roadmap | Roadmap | e5a59c57 / d01ebb86 | Roadmap | LOCKED / ROADMAP | roadmap docs | not a production feature | UNREGISTERED |
| 45 | P13 Integrated Integrity / Publication Certification Chain | Governance | P13.260881–274880 lineage | P13 | CLOSED AT GOVERNANCE LEVEL | extensive P13 tests + exit criteria | controlled-nonprod evidence; no external publication | Not a user feature |
| 46 | F5 Final Integrity / Cross-Module Integrity | Governance/Integrity | F5 lineage | F5 | HARDENED / CERTIFICATION TRACK | placement/movement/leave/QR/audit contracts | synthetic integrity boundary | Not a user feature |

## Functional Requirement Mapping

| Requirement | Inventory | Assessment |
|---|---|---|
| FR-01 Identity & Access | #22–24 | implemented/hardened; production authorization governed |
| FR-02 Master Data | #6, #2 | capability exists; production data boundary blocked |
| FR-03 Placement | #7–8 | strongly hardened; persistence governed |
| FR-04 Movement | #9–10 | implemented/hardened; browser/contract evidence |
| FR-05 Headcount | #10, #13–14 | contract/test coverage; production boundary disabled |
| FR-06 Documents | #2, #15–18, #43 | synthetic/document capability; production storage/rendering gated |
| FR-07 Leave & Escort | #11–12 | implemented/contracted; production execution gated |
| FR-08 Intake | #18–19, #44 | MFE adapter/runtime exists; broader roadmap remains |
| FR-09 Reporting | #4–5, #16–18 | substantial synthetic implementation; production storage gated |
| FR-10 Audit | #33–34, #45–46 | strong evidence coverage; production data boundary governed |

## Audit Findings

### A. Registry gap

Current \`FEATURE_REGISTRY.md\` contains only 3 Feature IDs. That is correct for the three explicitly registered additions, but it is not a complete capability inventory.

### B. Not everything missing from the registry needs a Feature ID

P9/P13 contracts, State Kernel, CI/CD, audit verifier, transaction/idempotency, observability and Cloudflare governance are primarily platform/governance capabilities. They should not automatically become feature IDs.

### C. Operational capabilities that should be retrospectively registered

Strong candidates:
1. Data Deteni CRUD
2. Placement / Room Governance
3. Movement
4. Temporary Exit / Izin
5. Escort / Pengawalan
6. QR Camera + Resolve → Action
7. QR Print / Download
8. Daily Guard Report
9. Daily Guard Report Lifecycle
10. MFE Evidence Intake / Daily Report Assembly
11. Admin Settings AI API + Branding

### D. Production readiness is still a separate boundary

Current repository governance explicitly retains:
- Migration Freeze = TRUE
- AI = OFF
- Repository = SYNTHETIC ONLY
- Production access = NOT AUTHORIZED
- Live PostgreSQL execution = BLOCKED
- Real detainee / production PII = prohibited

Therefore:
\`CODE EXISTS\` ≠ \`TEST EXISTS\` ≠ \`RUNTIME VERIFIED\` ≠ \`PRODUCTION ENABLED\`.

### E. Recommended reconciliation order

1. Keep Feature IDs 001–003 unchanged.
2. Use this inventory as the capability map.
3. Retrospectively assign Feature IDs only to genuine user-facing operational capabilities.
4. Reuse existing tests/commits as evidence; do not manufacture new checkpoints.
5. Re-run feature-specific browser/runtime verification.
6. Promote IMPLEMENTED → VERIFIED only after evidence satisfies the registry contract.
7. Do not alter schema/migration boundary during reconciliation.

## Conclusion

The repository contains a substantially larger capability surface than the current 3-entry Feature Registry. The dominant gap is traceability and feature-specific runtime evidence, not simply missing implementation.

The next engineering step is **Feature Reconciliation + Runtime Verification**, not indiscriminate feature development.
