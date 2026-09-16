# MTA DETENI — AI Gateway Implementation Contract v1.0

## Purpose

Define the implementation boundary that prevents AI-provider failures from propagating into the MTA DETENI core application.

## 1. Mandatory Interface

Application code calls an internal capability interface, never a provider SDK:

```ts
interface AiGateway {
  execute<TInput, TOutput>(request: AiRequest<TInput>): Promise<AiResult<TOutput>>;
}
```

Provider adapters implement the infrastructure boundary:

```text
AiGateway
  ├── DeterministicAdapter
  ├── LocalAiAdapter
  ├── PrivateAiAdapter
  └── ExternalProviderAdapter(s)
```

## 2. Result Contract

AI failure is represented as a typed result, not as an unhandled application exception:

```text
SUCCESS
FALLBACK_USED
UNAVAILABLE
RATE_LIMITED
TIMEOUT
PROVIDER_ERROR
NETWORK_ERROR
AUTH_ERROR
POLICY_BLOCKED
```

The application decides whether a failed AI capability is optional, retryable, deferred, or requires manual verification.

## 3. Circuit Breaker

Each external provider has an independent circuit state:

```text
CLOSED → failures threshold → OPEN
OPEN → cooldown → HALF_OPEN
HALF_OPEN → success → CLOSED
HALF_OPEN → failure → OPEN
```

An open circuit must fail fast and use the configured fallback. It must not continuously call an unavailable provider.

## 4. Timeout and Retry

- Every provider request has a hard timeout.
- Retry is finite and only for explicitly retryable failures.
- Retry uses exponential backoff with jitter.
- 4xx policy failures are not blindly retried.
- 429 respects provider retry guidance where safe but remains bounded by system policy.
- Retry never duplicates a core business mutation.

## 5. Transaction Boundary

Never perform:

```text
BEGIN TRANSACTION
   ↓
WAIT FOR EXTERNAL AI
   ↓
COMMIT
```

Instead:

```text
Validate
   ↓
AI assistance (if needed)
   ↓
Human/policy validation
   ↓
Short DB transaction
   ↓
Commit + audit
```

AI is outside the critical database transaction boundary.

## 6. Core-Service Firewall

Core modules must remain executable with the AI gateway disabled.

Required test mode:

```text
AI_MODE=disabled
```

In this mode:

- core pages load;
- core APIs respond correctly;
- CRUD works;
- workflow transitions work;
- documents can be generated from validated data;
- approvals work;
- audit works;
- deterministic reports work.

Optional AI functions return a controlled unavailable/deferred result.

## 7. UI Boundary

AI errors are local to the AI capability that requested them.

Forbidden behavior:

```text
AI exception → global error boundary → entire application failure
```

Required behavior:

```text
AI exception → typed AI result → fallback/deferred/manual path
                    ↓
             core UI remains usable
```

## 8. Security Boundary

The AI Gateway is not an authorization bypass. Authorization occurs before data is sent to an AI capability.

External egress requires policy evaluation for sensitive/restricted data. Secrets and raw sensitive payloads must never be included in telemetry.

## 9. Observability

Every AI invocation should carry:

- correlation ID;
- task type;
- provider identifier;
- model identifier where appropriate;
- latency;
- outcome class;
- fallback used;
- circuit state.

Do not log raw prompts, documents, health data, credentials or unrestricted detainee data.

## 10. Implementation Gate

Before an external AI adapter can be enabled in production:

1. provider adapter passes contract tests;
2. timeout test passes;
3. rate-limit test passes;
4. provider-error test passes;
5. network failure test passes;
6. circuit-breaker test passes;
7. fallback test passes;
8. idempotency test passes;
9. sensitive-data egress test passes;
10. AI-disabled core regression passes.

A provider integration that fails any item is not production eligible.
