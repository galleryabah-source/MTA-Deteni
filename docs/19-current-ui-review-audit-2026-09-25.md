# MTA DETENI — UI Baseline Review & Audit
## Status: REVIEWED / CURRENT REFERENCE
**Review date:** 25 September 2026  
**Scope:** current desktop UI, navigation shell, Data Deteni, Admin Settings, QR actions, authentication/session behavior, and local synthetic runtime persistence.

### 1. Current UI baseline
The current implementation is a light modern desktop-first enterprise/government interface. The visual direction remains **LOCKED / DESIGN FREEZE** from 25 September 2026. This document records the current implementation state as the operational reference; it does not replace the locked design decision.

### 2. Current desktop shell
- Light sidebar with grouped navigation.
- Desktop-first layout.
- Active navigation uses blue selected state.
- Sidebar has a functional minimize/expand toggle.
- Collapsed state hides labels while retaining navigation icons.
- Toggle is positioned at the upper-right edge of the sidebar and follows the sidebar width.
- Sidebar scrollbar is suppressed for normal desktop presentation.
- Header/top bar supports branding assets.
- Existing visual direction, spacing language, cards, hero and enterprise styling remain the approved baseline.

### 3. Data Deteni table — CURRENT CONTRACT
The table has **7 columns** in this exact order: No, Kode, Nama, Kebangsaan, Status, Penempatan, Aksi.

| No | Kode | Nama | Kebangsaan | Status | Penempatan | Aksi |
|---:|---|---|---|---|---|---|
| 1 | DET-2026-001 | SYNTHETIC A | Contoh | AKTIF | Blok A / Kamar 01 | Edit · Arsip · QR · Cetak · Download |
| 2 | DET-2026-002 | SYNTHETIC B | Contoh | AKTIF | Blok B / Kamar 02 | Edit · Arsip · QR · Cetak · Download |

QR is an action inside the **Aksi** column; it is not a separate table column.

### 4. Data Deteni form
The Add/Edit form contains: Kode, Nama (synthetic), Kebangsaan, Status, Penempatan Awal, and Batal/Simpan. Placement selection is resolved against ACTIVE master rooms. A new detainee may create a corresponding placement record.

### 5. QR access
Each detainee row exposes QR preview, Cetak, and Download. These actions are attached to the detainee action cell and must not change table column structure.

### 6. Admin Settings
Admin Settings uses horizontal top tabs: System, Security & Governance, Master Blok, Master Kamar, Master Data, Room Parameter, API AI, Desain Web.

Web Design settings support icon/favicon, logo and header image assets plus header title/subtitle. API AI configuration is a control-plane configuration; AI runtime remains OFF unless explicitly activated through the governed integration.

### 7. Persistence / current defect under investigation
A current functional defect has been reported: **Add/Edit Detainee Save is not completing successfully.**

Audit identified an important persistence boundary problem: uploaded branding assets had been stored together with the operational synthetic state. The repository has now been hardened so branding is isolated under `mta-deteni-branding-v1`, while operational state remains under `mta-deteni-demo-v2`. Legacy branding embedded in the operational state is migrated out during runtime load.

**Required verification after deployment:** Add, Edit, refresh, and re-open Data Deteni must all preserve the changed record. If Save still fails after this boundary fix, browser-console/runtime evidence is required before another functional mutation is made.

### 8. Persistence hardening — source audit result
A source-level cross-audit found that the core runtime, Admin Settings, Unified Shell, and Room Ops all participate in the same `mta-deteni-demo-v2` local-storage state. The core Save path has therefore been hardened to:
- serialize operational state with JSON rather than relying on `structuredClone`;
- normalize the expected operational collections (`detainees`, `placements`, `movements`, `leaves`, `documents`, `audit`, `rooms`, `blocks`) when loading;
- keep branding assets in the dedicated `mta-deteni-branding-v1` key;
- verify that the exact serialized operational payload can be read back immediately after `localStorage.setItem`;
- emit a `mta:data-changed` event only after the persistence write and verification succeed.

This is source-level hardening only; it does not alter database schema, migrations, RBAC, or the locked UI.

### 9. Runtime / governance observations
- Runtime is synthetic/local and database is not connected in the current preview baseline.
- AI is OFF.
- Migration/schema changes are not part of these UI fixes.
- Authentication/session persistence was separately hardened to survive F5 and Ctrl+Shift+R.
- UI changes must not alter RBAC, QR resolution, audit/evidence chain, document workflow, or database schema without an explicit separate decision.

### 10. Audit findings
**PASS / baseline**
- Locked visual direction documented.
- Desktop shell documented.
- Sidebar information architecture documented.
- Minimize/expand behavior defined.
- Data Deteni column contract now explicit.
- QR actions constrained to the Aksi column.
- Admin Settings horizontal navigation documented.
- AI and web branding configuration documented.
- Schema/migration boundary preserved.

**OPEN / requires verification**
- Add/Edit Detainee Save must be validated end-to-end in the deployed preview.
- QR preview/print/download should be validated against the existing clean-print contract.
- Admin branding should be tested for persistence without affecting operational save.
- Browser hard-refresh should preserve authenticated session and current UI state where intended.

### 11. Change-control rule
This document is a current implementation reference. Future UI work should preserve the locked visual direction and these table/action contracts. Improvements are allowed for correctness, accessibility, responsive desktop behavior, icon fidelity, spacing, performance, and functional integration. A new visual direction requires an explicit superseding design decision.

### 12. Canonical references
- `docs/18-desktop-ui-design-system-v1.0-LOCKED.md`
- `docs/03-implementation/UI-DESIGN-DECISION-2026-09-25.md`
- `docs/00-master-blueprint/MASTER-BLUEPRINT.md`
- `web/desktop-shell-v2.css`
- `web/desktop-shell-v2.js`
- `web/admin-settings-v9.js`
- `web/mta-app-runtime-full.js` — persistence hardening commit `4267e6cfaa7f27661547b629cfe142d2dcdd5b87`
