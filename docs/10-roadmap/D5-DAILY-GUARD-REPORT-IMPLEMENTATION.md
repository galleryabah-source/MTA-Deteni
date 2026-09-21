# D5 — Daily Guard Report Implementation Track v1.0

## Objective

Implement automated generation of the Daily Guard Team Report for an authorized regu/shift, using the approved template contract and verified MTA operational records.

## Work Packages

### D5.1 — Template Asset Preparation
- obtain sanitized/approved source template;
- identify page dimensions, orientation, typography, logos, background, watermark, photo frames and signature blocks;
- assign template ID/version/effective date;
- calculate asset checksum;
- keep production assets outside GitHub when classified/restricted.

### D5.2 — Report Data Contract
- define report aggregate and source-record references;
- map duty/regu/shift/attendance/handover/activity/headcount/escort/service/signature fields;
- define mandatory vs optional fields;
- define provenance and authorization requirements.

### D5.3 — Narrative Composer
- implement deterministic approved phrase templates;
- generate counts and summaries only from verified structured data;
- fail closed when mandatory facts are missing;
- prohibit fabricated operational facts.

### D5.4 — Photo Assembly
- authorized upload/reference;
- metadata and checksum;
- fixed template slots;
- deterministic ordering/cropping;
- privacy/access enforcement.

### D5.5 — Renderer
- implement controlled PDF renderer;
- preserve template page geometry;
- populate dynamic fields;
- render photographs;
- render signature blocks from authorized signature mechanism;
- produce stable document metadata.

### D5.6 — Preview and Workflow
- completeness check;
- preview;
- generate;
- review/revision;
- approve/finalize;
- archive.

### D5.7 — Regu/Shift Download
- date/regu/shift filters;
- single-report download;
- authorized bulk ZIP option;
- deterministic filename;
- download audit event.

### D5.8 — Integrity and Audit
- SHA-256 report hash;
- template-version binding;
- source-record provenance;
- generation/revision/approval/download/archive events.

## Synthetic Acceptance Fixtures

Use synthetic records for:

- Bravo/Pagi complete baseline;
- Alpha/Pagi complete baseline;
- no optional activity;
- multiple special activities;
- missing mandatory handover field;
- mismatched headcount;
- missing mandatory photograph;
- unauthorized restricted field;
- revision after review;
- historical template version.

## Rendering Regression Gate

For every approved template version:

1. render synthetic baseline;
2. compare page count/order;
3. compare text blocks and required headings;
4. detect overflow/clipping;
5. compare image placement and dimensions;
6. compare signature block geometry;
7. record renderer/template versions;
8. retain regression evidence.

Pixel-level comparison may use image-diff tooling where practical; tolerances must be explicitly documented for font rasterization/renderer differences.

## Security Gate

The implementation must pass:

- authorization scope test;
- restricted-field merge test;
- object/photo access test;
- audit event test;
- finalized-document immutability test;
- historical-template reproducibility test;
- no-real-data repository scan.

## Migration Rule

This workstream does not authorize schema migration. Any new database/storage contract must be separately reviewed and approved under the project's existing data-model, security and migration gates.

## Completion Gate

D5 Daily Guard Report is complete only when an authorized synthetic user can:

`Select Date + Regu + Shift → Complete Activities → Attach Photos → Validate → Preview → Generate → Review/Approve → Download`

and the resulting PDF conforms to the approved template version, has provenance and integrity metadata, and produces the required audit trail.


## Current Implementation Evidence — v1.1

The synthetic runtime now contains a controlled daily-guard-report contract and renderer at:

- `web/daily-guard-report-v2.js`
- `test/daily-guard-report.test.mjs`

Implemented in this checkpoint:

- deterministic structured `DAILY_GUARD_REPORT` data validation;
- template version binding: `DAILY-GUARD-v1.1`;
- canonical serialization with sorted object keys;
- SHA-256 integrity hash derived from report material;
- deterministic filename contract;
- 11-page baseline structural renderer;
- 1440 × 810 point / 16:9 landscape print target;
- explicit page ordering matching the baseline sections;
- controlled photo slots using synthetic placeholders only;
- closing/signature composition with synthetic signatory data;
- browser preview and print-to-PDF flow;
- finalized-report guard against silent overwrite;
- provenance via `sourceRecordIds`;
- regression tests for validation, deterministic hashing, mutation sensitivity and 11-page rendering.

Not yet certified by this checkpoint:

- official production template artwork/assets;
- real photo/object storage;
- production authorization enforcement;
- persistent database-backed report lifecycle;
- electronic signature integration;
- approval/finalization persistence outside the synthetic browser runtime;
- pixel-level regression against the formally approved production template.

No production schema migration or real detainee data is introduced by this implementation.
