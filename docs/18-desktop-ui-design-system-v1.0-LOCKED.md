# MTA DETENI — Desktop UI Design System v1.0 (LOCKED)

**Status:** LOCKED / DESIGN FREEZE  
**Approved:** 25 September 2026  
**Scope:** Desktop/Web UI  
**Reference:** User-approved design image supplied on 25 September 2026.

## 1. Design Decision

The approved desktop design is the single visual source of truth for MTA DETENI.

The approved direction combines:
- Light Modern Minimal
- Modern Professional
- Hero + Cards
- clean government/enterprise visual language

**No alternative UI direction is to be introduced unless the user explicitly reopens this design decision.**

## 2. Desktop Layout

Target:
- desktop-first;
- primary viewport >= 1025px;
- fixed left navigation;
- top application header;
- scrollable content workspace only;
- sidebar itself must not require a visible vertical scrollbar during normal dashboard use.

Recommended geometry:
- sidebar approximately 248px;
- top header approximately 64px;
- generous content workspace;
- white surfaces on a very light grey background;
- 12–16px card radius;
- subtle shadows and 1px borders.

## 3. Sidebar — LOCKED

Sidebar hierarchy:

### UTAMA
- Dashboard

### DATA & PENEMPATAN
- Data Deteni
- Penempatan

### OPERASIONAL
- Pergerakan
- Izin

### MONITORING
- Operational Monitor
- Operational Queue

### QR & PEMINDAIAN
- QR Center
- Scan Center
- Leave QR
- Camera Scan

### REKAM & KEPATUHAN
- Dokumen
- Audit Trail
- Laporan

### FASILITAS
- Room Ops

### PENGATURAN
- Pengaturan

Rules:
- one icon per menu item;
- icon must be rendered by the designated icon system/component;
- no duplicated glyphs from labels, pseudo-elements, or nested icon wrappers;
- no emoji icons;
- consistent icon size and optical alignment;
- active item uses blue filled/soft-blue selected state;
- section labels are small uppercase muted labels;
- menu labels remain concise;
- no unnecessary sidebar scrollbar in the standard desktop viewport.

## 4. Header

Header contains:
- MTA DETENI identity;
- global search;
- system status;
- notification;
- utility/action controls;
- authenticated user/profile.

Search uses a rounded light-grey field.

## 5. Dashboard Hero

Hero is a wide horizontal banner.

Contains:
- “Selamat Datang,”
- “MTA DETENI”
- “Sistem Manajemen Rumah Detensi Imigrasi”
- concise operational description;
- Rudenim/building visual on the right;
- date/time panel.

Hero visual must remain light, clean, institutional and photographic.

## 6. KPI Cards

Four primary KPI cards:
1. Total Deteni
2. Dalam Detensi
3. Izin Keluar Sementara
4. Proses Deportasi

Each card:
- pastel icon tile;
- clear numeric value;
- label;
- contextual trend/status;
- optional chevron/action affordance.

## 7. Quick Actions

Six main function cards:
- Data Deteni
- Penempatan
- Pergerakan
- Surat & Dokumen
- Scan QR Code
- Laporan

Cards use distinct but restrained pastel icon treatments.

## 8. Analytics / Operational Panels

Dashboard includes:
- Status Deteni donut/chart;
- Tren Jumlah Deteni;
- Aktivitas Terbaru;
- Daftar Deteni Terbaru.

Panels use white surfaces, subtle borders, rounded corners, and restrained visual hierarchy.

## 9. Typography

Use a modern sans-serif system stack.

Hierarchy:
- page title: strong and compact;
- section title: medium/bold;
- body: regular;
- metadata: smaller muted text;
- labels: concise.

Avoid decorative typography.

## 10. Color Direction

Primary:
- institutional navy/deep blue;
- bright operational blue.

Supporting:
- green for positive/active;
- orange for temporary-exit/warning;
- red for deportation/critical;
- purple only as secondary functional accent.

Background:
- very light neutral grey/blue.

The interface must remain predominantly white/light. Dark mode is not part of this locked desktop baseline.

## 11. Interaction Principles

- primary actions visually obvious;
- destructive actions clearly separated;
- hover states subtle;
- focus states visible;
- status badges consistent;
- tables optimized for administrative work;
- modal/dialog surfaces remain clean and compact;
- no visual element may obscure operational data.

## 12. Integrity Constraint

UI changes must not alter:
- database schema;
- migrations;
- RBAC/authorization;
- authentication boundary;
- QR resolution;
- operational workflow;
- mutation semantics;
- audit trail;
- evidence chain;
- document workflow.

UI is a presentation layer over the existing MTA DETENI domain/runtime.

## 13. Design Freeze

This specification is the approved desktop design baseline.

Future work should improve:
- implementation fidelity;
- accessibility;
- responsiveness within desktop breakpoints;
- icon consistency;
- spacing consistency;
- performance;
- functional integration.

Future work must **not redesign the visual direction** unless this document is explicitly superseded.
