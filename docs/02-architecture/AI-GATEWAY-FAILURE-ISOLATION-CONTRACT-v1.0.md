# MTA DETENI — AI Gateway & Failure Isolation Contract v1.0

## Status

Mandatory D2 architecture contract. External AI is optional infrastructure and never a dependency of core business operations.

## 1. Availability Invariant

> **AI can fail; MTA DETENI cannot fail because AI failed.**

If every external AI API is unavailable, the core application MUST remain operational.

AI failure MUST NOT cause:

- uncaught application exceptions;
- HTTP 5xx in unrelated/core operations;
- blank pages;
- permanent loading states;
- blocked workflows;
- failed core transactions;
- partial/corrupt state;
- duplicate transactions;
- authorization bypass;
- uncontrolled retry storms.

## 2. Dependency Rule

Core domain/application services MUST NOT directly import or require an external AI provider SDK.

All AI access is mediated through an internal capability boundary:

```text
Domain/Application
       |
       v
   AI Gateway
       |
  +----+--------------------+
  |    |                    |
Local  Private/Internal   External
 AI          AI              AI
  |    |                    |
  +----+--------------------+
       |
       v
  AI Result / Failure
       |
Validation + Policy + Human Verification
```

External providers are replaceable. Provider-specific credentials, models, endpoints and SDKs remain infrastructure concerns.

## 3. Execution Contract

Every AI operation MUST have:

- explicit task/capability type;
- correlation ID;
- bounded timeout;
- bounded retry policy;
- idempotency protection where mutation-adjacent;
- structured success/failure result;
- safe fallback classification;
- observability without sensitive payload leakage.

An AI operation MUST NOT hold an open database transaction while waiting for an external provider.

## 4. Failure Taxonomy

At minimum:

```text
TIMEOUT
RATE_LIMITED
QUOTA_EXHAUSTED
PROVIDER_5XX
PROVIDER_UNAVAILABLE
DNS_FAILURE
NETWORK_FAILURE
AUTHENTICATION_FAILURE
MODEL_UNAVAILABLE
GATEWAY_FAILURE
LOCAL_AI_UNAVAILABLE
UNKNOWN
```

Failures are expected states, not application-fatal exceptions.

## 5. Resilience Controls

The gateway SHOULD/SHALL implement according to capability risk:

1. strict request timeout;
2. bounded retry with exponential backoff and jitter;
3. circuit breaker;
4. provider health state;
5. provider selection/failover;
6. local/private AI fallback;
7. deterministic fallback;
8. graceful UI degradation;
9. idempotency keys;
10. structured telemetry;
11. recovery/reconnection;
12. dead-letter/quarantine for asynchronous AI jobs where appropriate.

Retry limits MUST be finite. AI failure MUST NOT trigger an infinite retry loop.

## 6. Fallback Priority

Use the least dependent mechanism capable of safely completing the task:

```text
1. Deterministic rule/service
          ↓
2. Local/private capability
          ↓
3. Institutional/internal AI
          ↓
4. Authorized external AI
```

A fallback MUST NOT weaken authorization, data classification, audit, retention or business rules.

## 7. Core Transaction Isolation

The following MUST NOT require AI availability:

- authentication/session;
- authorization/RBAC/ABAC;
- detainee master-data CRUD;
- workflow state transitions;
- movement/headcount operations;
- temporary-exit business transactions;
- document numbering/register;
- DOCX generation from validated data;
- approval/issue operations;
- audit recording;
- deterministic dashboards/reports.

AI may enrich or accelerate these processes but cannot be their availability prerequisite.

## 8. Intelligent Intake

OCR/extraction/classification/transcription assistance SHOULD be asynchronous where appropriate.

When AI is unavailable:

1. preserve the source/intake object;
2. record AI-unavailable status;
3. expose manual entry/verification;
4. allow non-AI workflow continuation where safe;
5. never treat missing AI output as an approved operational record.

## 9. UI Graceful Degradation

The UI MUST distinguish:

- core application unavailable;
- optional AI capability unavailable.

An AI outage message may be shown only in the affected optional capability. Core navigation and unrelated functions must remain usable.

No global error boundary may convert an optional AI failure into a whole-application failure.

## 10. Data Governance

Restricted/sensitive detainee information MUST NOT be sent to external AI unless explicitly authorized by applicable governance, security, privacy and data-processing controls.

Telemetry MUST NOT contain raw sensitive prompts, documents, health information, credentials or unrestricted detainee data.

## 11. Test Contract

The automated suite MUST execute the application with AI disabled and verify core operation.

Required scenarios:

- external AI timeout;
- HTTP 429;
- quota exhaustion;
- HTTP 5xx;
- provider unavailable;
- DNS/network failure;
- invalid credential;
- model unavailable;
- all external providers unavailable;
- local AI unavailable;
- AI Gateway unavailable;
- simultaneous AI failure during core transaction;
- retry/idempotency;
- provider recovery.

Acceptance invariant:

```text
AI OFF / FAILED
      ↓
Core Application = PASS
```

No test may accept a result merely because the error was caught. The application state and business transaction must also remain correct.

## 12. Production Observability

Track at minimum:

- provider availability;
- timeout rate;
- rate-limit rate;
- quota failures;
- circuit-breaker state;
- fallback frequency;
- local AI availability;
- AI task latency;
- AI task failure rate;
- recovery time;
- queued/quarantined AI jobs.

Do not expose sensitive payloads through logs or metrics.

## 13. Definition of Done

D2 AI resilience is complete only when:

- AI Gateway contract is documented;
- provider abstraction exists;
- failure taxonomy exists;
- timeout/retry/circuit-breaker policies are defined;
- fallback policy is defined;
- data-egress policy is defined;
- core services have no mandatory external AI dependency;
- failure-isolation tests are specified;
- production observability requirements are defined.

Production readiness additionally requires successful D9 failure-isolation regression evidence with all AI providers disabled.
