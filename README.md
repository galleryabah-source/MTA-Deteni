# MTA DETENI

**Manajemen Terpadu Administrasi Deteni**

MTA DETENI adalah model tata kelola administrasi deteni yang mengintegrasikan standardisasi data, integrasi proses, pengendalian akses, otomasi dokumen, pencatatan pergerakan, dan audit trail. Implementasi digitalnya disebut **MTA DETENI Digital** dan berfungsi sebagai instrumen pendukung perubahan tata kelola, bukan tujuan inovasi itu sendiri.

## Prinsip Utama

1. Governance/process improvement first; digital enablement second.
2. Deny-by-default, least privilege, separation of duties.
3. Data minimization and purpose limitation.
4. Health and other restricted personal data are isolated by domain and access scope.
5. Event-based history: critical records are not overwritten.
6. OCR, WhatsApp intake, transcript extraction, and AI produce draft/extracted data that requires validation.
7. AI is assistive only and never the final decision-maker.
8. No real detainee data, credentials, WhatsApp exports, health records, or production PII in this repository.
9. Every material change follows: Blueprint → Architecture → Contract → Security → Implementation → Test → Audit → Release.

## Current Status

**Foundation / D0 — Governance & Discovery**

The repository is the source of truth for the MTA DETENI blueprint, architecture, requirements, security baseline, roadmap, and implementation decisions.

## Repository Structure

- `docs/00-master-blueprint/` — master blueprint
- `docs/01-governance/` — PKP positioning and governance model
- `docs/02-requirements/` — system and functional requirements
- `docs/03-architecture/` — technical architecture
- `docs/04-domain/` — data dictionary and domain model
- `docs/05-process/` — AS-IS / TO-BE process design
- `docs/06-security/` — security baseline
- `docs/07-access-control/` — RBAC/ABAC and authority matrix
- `docs/08-integration/` — WhatsApp, OCR, transcript and intake design
- `docs/09-documents/` — document engine and templates
- `docs/10-roadmap/` — implementation roadmap
- `docs/11-testing/` — test strategy and quality gates
- `docs/12-adr/` — architecture decision records
- `docs/13-data-governance/` — classification, retention and privacy
- `PROJECT_STATUS.md` — current project status
- `CHANGELOG.md` — controlled project changes

## Security Boundary

This repository contains design and synthetic examples only. Operational detainee data must remain in authorized, access-controlled infrastructure and must never be committed to Git history.
