# MTA DETENI — AI Gateway Implementation Status

**Phase:** D2 — Architecture & Security Foundation  
**Branch:** `phase/d2-ai-resilience`  
**Status:** Kernel baseline implemented; runtime validation pending.

## Implemented

- Typed `AiRequest`, `AiResult`, provider and failure contracts.
- Central `FailureIsolatedAiGateway`; application code does not need provider SDKs.
- Provider capability filtering and explicit external-provider opt-out.
- Hard per-operation timeout.
- Finite retry with exponential backoff and jitter.
- Independent in-process circuit breaker per provider.
- Deterministic provider adapter for non-AI fallback capabilities.
- Controlled failure outcomes instead of uncaught AI exceptions.
- Unit-test fixtures covering disabled mode, fallback, external egress opt-out, circuit opening/half-open recovery, and bounded retry.

## Important boundary

This is the D2 kernel only. It is deliberately independent of PostgreSQL, domain transactions, Next.js UI, and provider SDKs. No database schema or migration is introduced by this change.

The in-process circuit state is suitable for the kernel baseline and tests. A multi-instance production deployment must later use a shared coordination mechanism or an equivalent provider-health strategy before claiming distributed circuit-breaker guarantees.

## Not yet production-eligible

The kernel is **not** sufficient by itself to enable a real external AI provider. Before production enablement, the repository must add and execute the D9 contract suite for timeout, 429/quota, 5xx, DNS/network failure, authentication failure, all-provider outage, data-egress policy, idempotency, recovery, and AI-disabled core regression.

No real credentials, detainee data, health data, WhatsApp exports, or production payloads are used here.
