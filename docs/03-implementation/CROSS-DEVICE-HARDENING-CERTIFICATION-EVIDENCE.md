# MTA DETENI — Cross-Device Hardening Certification Evidence

**Certification ID:** MTA-CDH-CERT-2026-09-26-01  
**Gate:** Cross-Device Hardening  
**PR:** #219  
**Evidence baseline commit:** 0c9b93c0c434653e16786fea6c47fb2aa2f1707c  
**Environment:** controlled-nonprod / synthetic runtime  
**Status:** CERTIFIED PENDING FINAL-EVIDENCE-COMMIT CI

## Scope

Cross-Device Hardening verifies that MTA DETENI remains one integrated application across portrait, landscape, mobile, tablet, and desktop boundaries without changing the established smartphone bottom navigation contract.

## Device matrix

| Device | Viewport | Result |
|---|---:|---|
| Phone portrait | 390×844 | PASS |
| Phone landscape | 844×390 | PASS |
| Tablet portrait | 768×1024 | PASS |
| Tablet landscape | 1024×768 | PASS |
| Desktop | 1440×900 | PASS |
| Desktop HD | 1920×1080 | PASS |

## Executable hardening checks

The dedicated cross-device-hardening.mjs gate verifies:

- no horizontal overflow at each viewport;
- exactly one mobile bottom navigation;
- five-button mobile navigation contract preserved;
- scan control has a usable touch target;
- desktop enhancement does not leak into mobile/tablet;
- desktop sidebar and collapse control remain operational;
- all core operational surfaces render without overflow;
- mobile form/dialog geometry remains horizontally contained;
- mobile form actions remain reachable after scrolling;
- authentication logout boundary remains enforced;
- browser page errors are rejected;
- synthetic/governance assertions remain locked.

The test deliberately treats a scrollable mobile dialog as valid: the contract is containment plus action reachability, not forcing the complete form to fit into a single viewport.

## CI evidence on baseline commit

On 0c9b93c0c434653e16786fea6c47fb2aa2f1707c:

- Cross-Device phone portrait — PASS
- Cross-Device phone landscape — PASS
- Cross-Device tablet portrait — PASS
- Cross-Device tablet landscape — PASS
- Cross-Device desktop — PASS
- Cross-Device desktop HD — PASS
- Existing browser matrix phone — PASS
- Existing browser matrix tablet — PASS
- Existing browser matrix desktop — PASS
- Existing browser matrix desktop HD — PASS
- Browser E2E phone — PASS
- Browser E2E tablet — PASS
- Browser E2E desktop — PASS
- Browser E2E desktop HD — PASS
- Application E2E — PASS
- Domain CI — PASS
- P9.6 local reconciliation — PASS
- Integration — PASS
- Runtime observation — PASS
- Cloudflare build check — PASS

## Governance

This gate does not authorize:

- production database access;
- production deployment;
- schema or migration execution;
- AI activation;
- real detainee/PII data;
- external durable publication.

Evidence assertions remain:

syntheticOnly = TRUE
productionAccessAuthorized = FALSE
migrationExecuted = FALSE
aiEnabled = FALSE

## Certification decision

The Cross-Device Hardening contract is satisfied at the controlled synthetic/non-production boundary.

Final certification is bound only after this evidence document commit itself passes all mandatory CI gates.

**Next master gate after certification:** Production Readiness Gate.
