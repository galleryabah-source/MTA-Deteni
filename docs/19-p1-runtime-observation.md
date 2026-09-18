# MTA DETENI — P1 Runtime Observation

## Purpose

Provide an independently observable, controlled-nonprod execution path for the existing P1 runtime-integrity certification contract.

This workflow is evidence-producing only. It does not authorize production access, execute migrations, enable AI, connect to live PostgreSQL, or perform external publication.

## Control mapping

| Control | Synthetic observation |
|---|---|
| P1-CTX-01 | Canonical critical-mutation context normalization and downstream continuity |
| P1-IDEM-02 | Transaction/idempotency boundary plus failure-matrix replay/conflict behavior |
| P1-TX-03 | Transactional mutation and rollback behavior |
| P1-AUDIT-04 | Audit continuity and fail-closed audit failure behavior |
| P1-OUTBOX-05 | Canonical outbox contract and fail-closed replay/conflict behavior |
| P1-OBS-06 | Observability context continuity |
| P1-FAIL-07 | Integrated P1 failure matrix |

## Evidence contract

The observation script writes:

- `artifacts/p1-runtime-evidence/p1-runtime-certification.json`
- one log per P1 control

The certification state is `OBSERVED_PASS` only when all seven controls exit with code zero. Otherwise it remains `OBSERVATION_INCOMPLETE`.

## Governance boundary

The workflow hard-codes:

- environment: `controlled-nonprod`
- production authorization: `false`
- migration executed: `false`
- AI enabled: `false`

No database credentials are required.

## Relationship to P13

P13 remains governed by its existing eight exit criteria and is not marked CLOSED by this workflow. P13-EXIT-06 still requires observable successful execution of the P13 closure candidate itself. This P1 workflow is a parallel certification path for runtime integrity.
