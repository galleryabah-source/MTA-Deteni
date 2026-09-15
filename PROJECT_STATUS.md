# MTA DETENI — Project Status

**Version:** P10.156 Release Evidence Hardening  
**Branch:** `phase10.14-database-verification-package`  
**Certification:** NOT CERTIFIED  
**Migration Freeze:** TRUE  
**AI:** OFF  
**Data Boundary:** SYNTHETIC ONLY

## Completed checkpoints

P9 kernel foundations; P10.1–P10.13 operational/domain/database-contract foundations; P10.14–P10.17 controlled database verification packages; P10.18–P10.21 document-output operationalization and runtime integration contracts; P10.22–P10.24 CI evidence, release-readiness and safety consolidation; P10.25–P10.34 runtime, authorization, document API, audit, transaction and security certification-readiness contracts; P10.35–P10.48 evidence and release hardening; P10.49–P10.54 temporary-exit vertical slice and operational execution boundaries; P10.55–P10.60 operational state, read model, repository/unified/transactional boundaries; P10.61–P10.68 command/runtime boundary contracts; P10.69–P10.76 persistence/release gates; P10.77–P10.84 synthetic persistent adapter and transaction verification; P10.85–P10.92 persistent-boundary hardening; P10.93–P10.100 authenticated command, artifact grant and evidence-integrity boundary; P10.101–P10.108 controlled HTTP/application integration; P10.109–P10.116 controlled PostgreSQL adapter specification; P10.117–P10.124 transaction/evidence hardening; P10.125–P10.132 synthetic concurrency/race verification; P10.133–P10.140 governed PostgreSQL verification readiness; P10.141–P10.148 governed verification evidence and orchestration boundary; P10.149–P10.156 release evidence hardening.

## P10.149–P10.156 technical actions

- P10.149: release evidence continues to require commit/checkpoint identity and safe release state.
- P10.150: duplicate test identities are rejected for governed evidence manifests.
- P10.151: duplicate evidence-file paths are rejected.
- P10.152: unsafe release state is rejected during both build and assertion.
- P10.153: unsupported evidence schema versions are rejected.
- P10.154: release manifest arrays are defensively copied at construction.
- P10.155: audit evidence is defensively copied and validated.
- P10.156: post-construction manifest tampering remains cryptographically detectable.

## CI / evidence hardening

The authoritative P10 regression gate now includes P10.141–P10.148 and P10.149–P10.156. The release evidence manifest hardening is tested independently and remains synthetic-only. Existing legacy evidence tests remain compatible while the governed path adds stricter structural integrity controls.

## External blockers

- GitHub Actions runner/evidence transport remains OPEN: prior failed runs had no executable steps or usable logs. This is not treated as an application assertion failure.
- `package-lock.json` remains OPEN as a reproducibility/certification blocker. No lockfile is fabricated.
- Live PostgreSQL verification remains OPEN pending governance clearance and an approved non-production target.

## Integrated architecture

Authenticated HTTP request → CSRF → server-side authentication/authorization/scope/duty/classification/SoD → authoritative command composition → idempotency → unified temporary-exit service → document preparation → approval → issuance → artifact handoff → single-use controlled download grant → download → operational exit → handover → return → duty completion → close → critical transaction → controlled PostgreSQL adapter → audit/outbox intent → COMMIT → post-commit provider.

## Release interpretation

Synthetic PASS means the software contract passed its synthetic tests. It does not certify PostgreSQL, RLS, production infrastructure, or operational readiness. Production remains **NOT CERTIFIED** until independently observable CI evidence, dependency reproducibility, governed PostgreSQL verification, security controls and explicit governance approval are complete.

## Safety

- Migration Freeze TRUE.
- No schema migration executed.
- No production database operation.
- AI OFF.
- Synthetic fixtures/test doubles only.
- No provider activation.
- No real detainee data/secrets.
- `main` remains untouched by implementation commits.

## Next gates

P10.157+: cross-check the release manifest against regression evidence and introduce a final pre-certification consistency gate, still without live PostgreSQL execution or freeze lift.
