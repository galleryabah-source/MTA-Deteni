# MTA DETENI — AI Document Template Intelligence & Replication Design v1.0

## Status

**LOCKED DESIGN CONCEPT — 25 September 2026**

This design is an official part of the MTA DETENI document architecture. It extends the Document Engine and does not replace existing governance, workflow, security, approval, audit, or template controls.

## 1. Objective

Enable MTA DETENI to accept an authorized reference document uploaded into the application and turn it into a governed, reusable template so that future documents can be generated with the same approved structure and visual identity while replacing variable content with current operational data and images.

This applies to documents such as:

- Laporan Harian;
- Surat Perintah;
- Surat Tugas Pengawalan;
- Surat Izin Keluar Sementara;
- Laporan berkala;
- Berita Acara;
- other approved operational documents.

## 2. Canonical Flow

```
Reference Document
(.docx / .pdf / supported format)
        ↓
AI Document Analysis
        ↓
Structure + Layout + Field + Image Analysis
        ↓
Template Blueprint
        ↓
Data / Image Mapping
        ↓
Human Review & Correction
        ↓
Template Approval
        ↓
Versioned Template Registry
        ↓
Current MTA Data + Current Images
        ↓
Deterministic Document Engine
        ↓
DOCX / PDF
        ↓
Validation → Approval → Issue → Register → Audit → Archive
```

## 3. Reference Fidelity Contract

The uploaded approved reference is treated as the visual and structural source of truth for the template.

The system must preserve, subject to the capabilities and constraints of the selected output engine:

- page size and orientation;
- margins;
- header and footer;
- logo and branding placement;
- typography;
- paragraph structure;
- spacing and alignment;
- tables, borders and cell structure;
- numbering;
- image placement, size, crop and alignment rules;
- captions;
- signature blocks;
- repeated page elements;
- page breaks and multi-page behavior.

The goal is **document fidelity**, not merely copying text.

## 4. Variable Content Contract

Variable content is explicitly modeled rather than inferred during every generation.

Examples:

```
{{tanggal}}
{{nomor_surat}}
{{nama_deteni}}
{{nomor_deteni}}
{{kewarganegaraan}}
{{nama_petugas}}
{{kegiatan}}
{{jumlah_deteni}}
{{foto_kegiatan_01}}
{{caption_foto_01}}
```

Each field should define, as applicable:

- key;
- label;
- type;
- required/optional;
- source;
- transformation rule;
- validation rule;
- sensitivity classification;
- verification requirement.

Images are first-class template fields/image slots.

## 5. Laporan Harian Use Case

A reference Laporan Harian uploaded to MTA DETENI may contain multiple pages, tables, photographs, captions, headers, footers and fixed visual composition.

After approval, a new report uses:

- current date;
- current guard group/shift;
- current operational figures;
- current narrative/activity data;
- current tables;
- current photos;
- current captions;
- other approved actual values.

The resulting report retains the approved reference design and structure. The system must not create a new visual design merely because the data changed.

If the number of records/photos changes page count, the engine must apply the governed pagination rules while preserving the template's design language and structural constraints.

## 6. AI Responsibilities

AI may:

- inspect reference documents;
- extract semantic structure;
- detect candidate fields;
- detect tables and repeated sections;
- detect image slots;
- infer candidate data mappings;
- propose validation rules;
- flag ambiguous or low-confidence mappings;
- compare generated output against the approved template;
- assist template correction.

AI must not:

- make the final administrative decision;
- directly mutate authoritative detainee records;
- activate an unapproved template;
- silently modify an ACTIVE template;
- issue an official document outside the governed workflow;
- send restricted data to an external provider without authorization.

## 7. Deterministic Renderer Responsibilities

The Document Engine is the authoritative renderer.

It must:

1. load the exact approved template version;
2. resolve approved fields;
3. validate required values;
4. insert current authorized images;
5. preserve layout and visual structure;
6. handle pagination;
7. generate the output;
8. calculate integrity metadata;
9. bind the output to template/version and source records;
10. emit audit evidence.

AI must not be the final renderer for official documents.

## 8. Template Registry Extension

The existing Template Registry is extended with:

- template_id;
- document_type;
- version;
- source_document_id;
- source_document_hash;
- effective_date;
- status;
- owner/authority;
- layout_contract;
- field_schema;
- field_mapping;
- image_slot_schema;
- validation_rules;
- approval_reference;
- created_by / approved_by;
- created_at / approved_at;
- renderer_contract;
- fidelity_test_reference.

An ACTIVE template is immutable. Changes create a new version.

## 9. Document Provenance

Every generated document must be traceable to:

- source template;
- template version;
- reference document/hash;
- generator version;
- actor;
- generation time;
- source data references;
- image references;
- workflow state;
- audit events;
- output hash.

## 10. Fidelity Verification

A template cannot be considered production-ready solely because fields render successfully.

Verification should include:

- structural comparison;
- required-field validation;
- table/section validation;
- image-slot validation;
- page-count/overflow checks;
- visual regression where supported;
- representative synthetic fixtures;
- deterministic regeneration check.

Any material fidelity deviation must be surfaced for review.

## 11. Security and Data Governance

Reference documents may contain official or sensitive information. Therefore:

- repository remains synthetic-only;
- operational source documents remain in authorized storage;
- access follows RBAC/ABAC;
- restricted data is minimized;
- external AI transfer is policy-controlled;
- secrets never enter browser/localStorage;
- generated documents inherit appropriate classification and retention controls;
- audit evidence must not expose sensitive payloads unnecessarily.

## 12. Failure Isolation

The feature must follow the existing AI Failure Resilience Roadmap.

If AI is unavailable:

- existing approved templates remain usable;
- deterministic generation remains available;
- manual template creation/review remains possible where supported;
- core MTA DETENI workflows must not fail;
- no partial or corrupt official document may be issued.

## 13. Implementation Gates

Implementation follows:

**Contract → Security → Storage → Parser/Analyzer → Template Registry → Human Review → Renderer → Fidelity Tests → Workflow Integration → Audit → Controlled Non-Prod → Production Gate**

No schema migration or production AI activation is implied by this design lock.
