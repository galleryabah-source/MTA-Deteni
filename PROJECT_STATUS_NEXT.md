# MTA DETENI — Next Gate

**Foundation:** v1.79
**Current:** P13.9361–9480 — synthetic multi-device continuity boundary implemented; CI observation blocker remains

## Completed (through current gate)

- Deterministic reconnect transitions and stable queue identity.
- Immutable reporting snapshots, artifacts, export envelopes, renderer boundaries and daily guard report certification.
- Database/access contract and migration freeze; no concrete PostgreSQL connection.
- Critical mutation transaction, idempotency, audit and outbox integration seams.
- Non-production aggregate repositories and deterministic reconciliation.
- Unified application mutation services for detainee registration, placement, movement and temporary-exit advancement.
- Canonical five-step lifecycle orchestration/certification with correlation and version propagation.
- Deterministic seven-class failure/recovery matrix with explicit terminal/recovery semantics.
- Synthetic recovery journey with zero-effect pre-commit behavior and post-commit retry deduplication.
- Recovery evidence bound to command, request hash, event, correlation, aggregate and version identities.
- Recovery evidence bound directly to lifecycle certification steps.
- Retry keys deterministically bound to command identity plus source fingerprint; fingerprint drift rejected.
- Unified seven-class recovery regression, including explicit offline reconnect review.
- Dedicated lifecycle event-envelope validation with no `commandId`/`requestHash` substitution.
- Runtime execution context bound to runtime mode, device class, network scope, authentication and certification journey.
- Runtime certification binding to lifecycle and recovery certification records.
- Synthetic LAN/offline runtime handoff contract requiring authorization and reconciliation continuity.
- Runtime continuity coordinator combining authenticated runtime context, queue state, reconciliation decision and handoff identity.
- Pending/offline queue cannot be treated as ready without reconciliation evidence.
- Reconnect conflict produces explicit `BLOCKED` continuity state.
- Backup continuity coordinator validates synthetic backup manifests and predecessor-chain references.
- Missing or mismatched backup predecessor references fail closed.
- Unified synthetic continuity certification binding runtime execution, lifecycle certification, recovery certification, queue/reconciliation readiness and backup-chain readiness.
- Continuity certification rejects unresolved runtime queue/reconciliation or backup states.
- Continuity certification preserves lifecycle projection/version identity.
- Offline-first operational session contract: device-scoped session identity, execution/network/runtime-scope binding, authenticated synthetic admission, LAN/LOCAL-only local command admission, pending-queue admission invariant, deterministic clean-close evidence, and explicit interruption state.
- Session close continuity binding: clean close requires synchronized queue, ready backup, READY runtime continuity and matching continuity certification; close evidence is device/install/network/execution bound.
- Interrupted-session safety: interrupted/closed sessions cannot admit local commands; interrupted sessions cannot be represented as clean handoff even with fabricated close evidence.
- Session reconciliation completion: per-command receipts bind session/execution/command identity; conflicts cannot yield completion receipts; proof requires one unique receipt for every admitted command; partial reconnects fail closed.
- Reconciliation state transition: an open session can explicitly enter `RECONCILIATION_REQUIRED` and return to `ACTIVE` only after complete reconciliation proof; terminated sessions cannot be resumed through reconciliation.
- Integrated offline-first continuity journey now exercises deliberate interruption, interruption evidence, explicit reconnect authorization, scope revalidation, queue rehydration and APPLY/SKIP_DUPLICATE transitions before clean close.
- Continuity certification explicitly binds session, execution, device, installation and network identities and rejects backup source identity drift.
- Synthetic multi-device continuity proof: authorized handoff within the same installation/network scope is admissible; unauthorized or network-drift handoff is fail-closed.
- No database driver, migration, production persistence, real detainee data, or AI activation.

## Next gate: P13.9481–9600

Build the runtime handoff proof: explicit CLOUD/LAN/LOCAL transitions, authorization binding, queue/reconciliation requirements, and fail-closed mode/device/network drift. Then bind the handoff proof into the continuity certification chain.

## Governance lock

Migration Freeze TRUE. AI OFF. Repository SYNTHETIC ONLY. Production access NOT AUTHORIZED. Live PostgreSQL execution BLOCKED pending explicit governance clearance and approved non-production target.

## Observation blocker

GitHub Actions remains an observation blocker. New commits must not be described as CI-PASS until observable workflow steps/logs/artifacts exist.
