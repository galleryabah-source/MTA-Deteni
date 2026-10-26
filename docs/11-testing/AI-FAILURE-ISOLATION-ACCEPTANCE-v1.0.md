# MTA DETENI — AI Failure Isolation Acceptance v1.0

## Objective

Prove that MTA DETENI remains operational when AI services fail, including when all external AI providers are unavailable.

## Mandatory Test Matrix

| Scenario | Expected Result |
|---|---|
| AI disabled | Core application PASS |
| External API timeout | Core application PASS |
| HTTP 429 / rate limit | Core application PASS |
| Quota exhausted | Core application PASS |
| HTTP 5xx | Core application PASS |
| Provider unavailable | Core application PASS |
| DNS failure | Core application PASS |
| Network unavailable | Core application PASS |
| Invalid/missing AI credential | Core application PASS |
| Model unavailable | Core application PASS |
| All external providers unavailable | Core application PASS |
| Local AI unavailable | Core application PASS |
| AI Gateway unavailable | Core application PASS |
| AI failure during core transaction | Core transaction PASS |
| Retry after failure | No duplicate transaction |
| Recovery after provider restoration | Core application PASS + safe recovery |

## Core Invariants

During every scenario:

- no uncaught exception;
- no blank page;
- no permanent spinner;
- no blocked unrelated workflow;
- no failed core business transaction caused by AI;
- no duplicate mutation;
- no partial/corrupt state;
- no authorization bypass;
- audit remains valid;
- UI remains usable.

## Release Gate

A release MUST be rejected if any AI failure can break a core workflow or corrupt application state.

The decisive test is:

> **Disable every AI provider. Run the complete core application regression suite. All core tests must pass.**

