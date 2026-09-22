# MTA DETENI — Next Gate

**Foundation:** v1.122+  
**Current:** P13.16441–18240 — publication request admission through authorization-decision evidence implemented and CI-verified on the current branch

## Completed through current audited gate

- P13.13681–13800: post-dispatch acknowledgement identity binding.
- P13.13801–14040: acknowledgement replay and continuity certification.
- P13.14041–14400: completion proof, continuity receipt and runtime closure.
- P13.14401–15000: integrated recovery closure and certification.
- P13.15001–15360: final closure audit record and certification.
- P13.15361–15720: final closure audit evidence envelope and replay guard.
- P13.15721–16080: operational audit projection boundary.
- P13.16081–16200: publication envelope with READY_FOR_PUBLICATION and no external publication.
- P13.16201–16320: deterministic publication replay ADMIT/REPLAY/CONFLICT.
- P13.16321–16440: integrated publication certification.
- P13.16441–16560: publication request admission; certified identity, synthetic-only and transport-free.
- P13.16561–16680: publication request replay guard.
- P13.16681–16800: publication request certification.
- P13.16801–16920: review-only dispatch candidate.
- P13.16921–17040: dispatch candidate replay guard.
- P13.17041–17160: dispatch candidate certification.
- P13.17161–17520: review-only dispatch authorization and certification.
- P13.17521–17880: non-granting authorization decision and certification.
- P13.17881–18240: authorization-decision evidence and certification.

## Integrated publication-chain gate

Added an end-to-end synthetic TypeScript contract test composing:

`publication readiness → request admission → request replay/certification → dispatch candidate → authorization → authorization certification → authorization decision → decision evidence certification`

The chain preserves exact identity/fingerprint continuity and requires:
- `syntheticOnly=true`
- `externalTransportRequested=false`
- `authorizationGranted=false`
- `dispatchApproved=false`
- `dispatchExecuted=false`

It remains strictly before external transport and durable publication.

## Deployment parity

Cloudflare deployment remains blocked at the credential/permission boundary. Source now has an explicit deployment parity contract; HTTP 200 alone is not deployment proof.

## Authentication / RBAC

Dedicated login gate, protected `/api/mta/me` role resolution, canonical OWNER/ADMIN/EDITOR/REVIEWER/AUDITOR roles, client/API action policy, public self-registration removal, and RBAC/RLS parity audit are implemented. Frozen-RLS DELETE drift for EDITOR on placements/movements/leaves remains documented; no migration was changed or executed.

## CI evidence

Current head: `5dbecdcbf3b010898f151a3200d2621349ac0640`

- Domain CI #1690: **SUCCESS**
- P1 Runtime Observation #393: **SUCCESS**
- Deployment parity auth/RBAC contract: **SUCCESS**
- TypeScript domain tests: **SUCCESS**
- Integrated acceptance/runtime/recovery/device-handoff/evidence gates: **SUCCESS**

## Governance lock

Migration Freeze TRUE. AI OFF. Repository SYNTHETIC ONLY. Production access NOT AUTHORIZED. Live PostgreSQL execution BLOCKED pending explicit governance clearance and approved non-production target.

## Next gate

P13.18241–19080 — continue authorization-decision evidence → closure → integrity → receipt continuity, preserving the same identity/fingerprint chain and zero external publication side effect.
