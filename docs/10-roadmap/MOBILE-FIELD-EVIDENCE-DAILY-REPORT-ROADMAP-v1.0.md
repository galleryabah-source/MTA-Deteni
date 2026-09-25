# MTA DETENI — Mobile Field Evidence Intake & Daily Report Roadmap v1.0

## Status

**LOCKED / NEAR-TERM IMPLEMENTATION PRIORITY — 25 September 2026**

## Objective

Provide a smartphone-first field capture workflow that supplies current data and photographs to the MTA DETENI Daily Report Engine without requiring field officers to manually recreate the report.

## MFE-01 — Mobile Capture Contract

Define mobile capture events for photo, note, quick category, time, actor, context/location where permitted, voice note and attachments.

**Exit:** canonical evidence contract is defined and synthetic fixtures exist.

## MFE-02 — Smartphone Field UI

Implement a dedicated mobile field capture interface with large touch targets and minimal typing.

Core actions:

- Ambil Foto
- Catat Kejadian
- Input Data
- Voice Note
- Simpan
- Sinkronkan
- Lihat Timeline

**Exit:** critical capture journey works on supported smartphone browsers.

## MFE-03 — Evidence Store / Outbox

Persist field captures as evidence items with provenance and local sync state.

**Exit:** capture survives temporary network loss and remains available for synchronization.

## MFE-04 — Offline / Reconnect

Integrate with the existing offline/local continuity contract.

Required behavior:

- local capture;
- deterministic idempotent sync;
- ACK;
- replay safety;
- conflict detection;
- reconnect recovery.

**Exit:** controlled non-production offline/reconnect evidence PASS.

## MFE-05 — Photo Context

Make photographs first-class evidence.

Support:

- event reference;
- report inclusion;
- ordering;
- caption draft;
- image-slot candidate;
- provenance;
- verification status.

**Exit:** selected field photos can be deterministically supplied to a report dataset.

## MFE-06 — Daily Report Inbox

Provide a day-level mobile summary of:

- evidence count;
- photo count;
- event count;
- unsynced count;
- incomplete count;
- timeline;
- quick capture.

**Exit:** officer can see whether today's field evidence is synchronized and complete enough for report assembly.

## MFE-07 — Daily Dataset Assembly

Aggregate verified evidence into a governed Daily Dataset.

**Exit:** current synthetic events and photographs populate the correct report fields and image slots.

## MFE-08 — AI Assistance

When AI is enabled and authorized, provide optional assistance for:

- event grouping;
- note normalization;
- caption drafting;
- evidence-to-field mapping;
- missing-information detection;
- inconsistency detection.

Raw source evidence must remain authoritative.

**Exit:** AI failure does not block dataset/report creation.

## MFE-09 — Template Integration

Connect the Daily Dataset to the locked AI Document Template Intelligence & Replication capability.

Priority template:

**Laporan Harian**

The output must preserve the approved reference design while replacing variable data and images with current approved values.

## MFE-10 — Report Preview / Review

Provide authorized review before finalization.

**Exit:** reviewer can inspect data, photos, captions and template fidelity before approval.

## MFE-11 — Audit & Provenance

Record:

- capture actor/time;
- evidence identity;
- source device/session where policy permits;
- synchronization events;
- source photo references;
- report dataset references;
- template/version;
- generated document;
- approval/finalization;
- output hash.

## MFE-12 — Controlled Non-Production E2E

Required journey:

```
Smartphone Capture
→ Offline Save
→ Reconnect
→ Sync
→ Daily Timeline
→ Dataset Assembly
→ Template Mapping
→ Generate
→ Review
→ Finalize
→ Audit Evidence
```

## MFE-13 — Production Gate

Production requires existing MTA DETENI gates plus:

- mobile browser acceptance;
- offline/reconnect evidence;
- storage/security review;
- image handling/security review;
- authorization review;
- document fidelity evidence;
- audit evidence;
- failure-resilience evidence.

## Priority

This roadmap is a near-term implementation workstream, not a separate product. It must reuse the canonical MTA DETENI runtime, State Kernel, audit/evidence chain, RBAC/ABAC, offline continuity and Document Engine.

No schema migration or production activation is implied by this roadmap until the applicable governance gates are cleared.
