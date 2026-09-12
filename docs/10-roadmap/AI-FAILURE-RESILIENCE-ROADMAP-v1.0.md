# MTA DETENI — AI Failure Resilience Roadmap v1.0

## Status

**Mandatory architectural addendum to Master Roadmap v1.2.** This document is part of the roadmap governance baseline and applies to D2–D10.

## 1. Non-Negotiable Availability Requirement

> **Core MTA DETENI must remain fully operational when every external AI API is unavailable.**

AI provider outage, timeout, HTTP 429/rate limit, quota exhaustion, HTTP 5xx, DNS/network failure, invalid credential, model unavailability, or provider-side degradation must **not** cause:

- uncaught application errors;
- blank pages;
- blocked core workflows;
- failed core business transactions;
- corrupt or partial state;
- duplicate transactions;
- uncontrolled retries;
- permanent loading/spinner states;
- dependency of core operations on an external AI provider.

## 2. Architectural Position

External AI is an **optional, replaceable infrastructure capability**, never a domain dependency.

Required architecture:

```text
Core Application
      |
      +---- Deterministic Rules / Services
      |
      +---- AI Gateway / Orchestrator
                 |
        +--------+---------+----------------+
        |                  |                |
   Local AI          Private/Internal   External AI
   capability             AI             providers
        |                  |                |
        +------------------+----------------+
                           |
                    Result / Suggestion
                           |
                  Validation + Policy
                           |
                    Human Verification
```

The core application must not directly depend on a provider SDK or provider-specific API contract.

## 3. Required Failure-Isolation Controls

The AI Gateway must provide, as applicable:

1. strict request timeout;
2. bounded retry with backoff;
3. circuit breaker;
4. provider health state;
5. provider failover;
6. local/private AI fallback;
7. deterministic fallback;
8. graceful UI degradation;
9. structured failure classification;
10. observability without leaking sensitive payloads;
11. idempotency protection for retried operations;
12. recovery/reconnection handling.

Retrying an AI request must never cause a duplicate core business transaction.

## 4. Processing Priority

For every capability, prefer the least dependent mechanism:

```text
Deterministic rule
      ↓ if insufficient
Local/private capability
      ↓ if justified
Institutional/internal AI
      ↓ if authorized and useful
External AI provider
```

Examples of deterministic-first work:

- schema validation;
- required-field checks;
- date/number validation;
- workflow state transitions;
- authorization decisions;
- numbering/register;
- document integrity/hash;
- duplicate detection;
- deterministic reporting;
- policy checks.

## 5. Roadmap Integration

### D2 — Architecture & Security Foundation

Must define and approve:

- AI Gateway contract;
- provider abstraction;
- failure taxonomy;
- timeout/retry/circuit-breaker policy;
- local/private fallback strategy;
- deterministic fallback strategy;
- AI data-egress policy;
- sensitive/restricted-data protection;
- availability and graceful-degradation requirements.

**D2 Gate:** AI failure isolation design approved.

### D3–D6 — Core Application

Core administration, movement, temporary exit, documents, approval, leadership and RBAC must remain functional with AI completely disabled.

No core service may import or require an external AI SDK to complete its business transaction.

### D7 — Intelligent Intake

OCR, extraction, classification and transcript assistance must be asynchronous/non-blocking where appropriate.

If AI is unavailable:

- source/intake record remains safely stored;
- manual entry/verification remains available;
- workflow does not fail;
- no AI result is silently treated as authoritative.

### D8 — Reporting & Intelligence

AI-generated summaries, analysis or recommendations are optional. Deterministic dashboards and permitted reports must remain available without AI.

### D9 — Pilot, Security Hardening & UAT

Mandatory failure tests:

- AI timeout;
- HTTP 429/rate limit;
- quota exhausted;
- HTTP 5xx;
- provider outage;
- DNS failure;
- network unavailable;
- invalid/missing credential;
- model unavailable;
- all external providers unavailable;
- local AI unavailable;
- AI Gateway unavailable;
- simultaneous AI failure during normal core transaction;
- retry/idempotency test;
- recovery after provider restoration.

Acceptance requires:

```text
AI unavailable → Core application PASS
AI timeout    → Core application PASS
AI 429        → Core application PASS
AI 5xx        → Core application PASS
Network down  → Core application PASS
All AI down   → Core application PASS
```

There must be no uncaught exception, failed core transaction, corrupt state, duplicate transaction, blank UI, or blocked workflow.

### D10 — Production & Institutionalization

Production must include:

- AI provider health monitoring;
- failure/degradation metrics;
- alerting;
- fallback runbook;
- provider replacement procedure;
- local/private AI capacity monitoring where deployed;
- periodic resilience testing;
- controlled chaos/failure drills;
- incident evidence and post-incident review.

## 6. CI/CD Quality Gate

AI failure-isolation tests become a regression gate. A release must not pass if an AI outage can break a core workflow.

Required principle:

> **AI can fail; MTA DETENI cannot fail because AI failed.**

## 7. Security and Data Governance

No sensitive/restricted detainee information may be sent to an external AI provider unless explicitly authorized under applicable governance, security, privacy and data-processing controls.

The fallback mechanism must not weaken authorization, classification, audit, retention or data-minimization controls.

## 8. Roadmap Completion Criterion

MTA DETENI is not considered production-ready until the AI failure-isolation acceptance suite passes and evidence demonstrates that the application remains operational with all AI providers disabled.
