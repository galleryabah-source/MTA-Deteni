# E6 — Document Approval Gate Contract v1.0

## Purpose

The Document Engine MUST NOT issue an administrative document solely because generation succeeded. Approval and issuance are controlled workflow actions subject to authorization.

## Required lifecycle

```text
DRAFT → GENERATED → REVIEWED → APPROVED → ISSUED
```

The approval gate evaluates the current lifecycle state before permitting the requested action.

## Controls

1. `APPROVE` is valid only from `REVIEWED`.
2. `ISSUE` is valid only from `APPROVED`.
3. Authorization is mandatory for both actions.
4. Required-approval contracts cannot bypass approval.
5. Issuance requires an independent second approver when configured as required.
6. Self-approval is rejected.
7. Invalid workflow state fails closed.
8. Every request carries an actor and correlation ID for later audit persistence.
9. The gate does not persist data and does not perform database transactions.
10. The gate does not call AI.

## Security boundary

The `isAuthorized` input represents a decision already evaluated by the security control plane. Production integration MUST derive it from the existing authorization kernel; callers MUST NOT accept a client-supplied authorization flag as proof of permission.

## Future integration

The next integration layer must connect this gate to:

- RBAC/ABAC authorization decision service;
- approval/signature metadata;
- immutable document version binding;
- audit integrity chain;
- atomic lifecycle transition persistence.

No database schema or migration is introduced by this contract.
