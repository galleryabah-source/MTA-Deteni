# MTA DETENI — Mobile & Tablet UI Hardening

## Scope

This gate hardens the presentation/runtime shell for smartphone and tablet use while preserving the desktop left navigation and the existing synthetic functional runtime.

## Responsive contract

- `>1024px`: desktop shell with left vertical navigation; existing collapsible behavior is retained.
- `<=1024px`: mobile/tablet shell uses full-width content and a fixed bottom navigation dock.
- `<=430px`: compact phone spacing, single-column KPI layout, single-column detainee metadata.
- Horizontal overflow is explicitly blocked at the document/body/main boundaries.
- Safe-area inset is included for devices with gesture navigation/home indicators.
- Main content receives bottom padding so the fixed navigation does not cover actionable content.

## Mobile navigation contract

Five primary actions are presented:

1. Beranda
2. Deteni
3. **Scan QR** — intentionally larger and centered as the primary operational action.
4. Laporan
5. Menu — opens the complete existing navigation as a bottom sheet.

The QR action delegates to the existing adaptive camera scanner (`mtaQrCameraV2`) and does not create a second QR/authentication path.

## Detainee presentation

The desktop table remains the source presentation for larger screens. On smartphone/tablet widths, the same rows are projected into responsive cards containing:

- detainee code;
- name;
- status;
- nationality;
- placement;
- existing row actions.

Search changes are synchronized to the mobile card projection without duplicating the underlying data store.

## Runtime/offline integration

`mobile-shell-v1.js` is injected by the Cloudflare static adapter and included in the Service Worker shell cache. The mobile shell therefore remains part of the same offline/LAN-ready presentation boundary rather than becoming a separate application.

## Safety / governance

- Synthetic data only.
- No production database access.
- AI remains OFF.
- No migration is introduced by this UI gate.
- QR scanning remains an input mechanism, not an authentication or authorization mechanism.

## Verification

The device regression workflow covers phone `390x844`, tablet `768x1024`, and desktop `1440x900`. It checks horizontal overflow, offline queue exposure, QR scanner API exposure, mobile/tablet bottom-shell visibility, central QR action presence, and responsive detainee-card rendering.

The physical camera itself cannot be certified by headless CI; real-device camera/permission behavior remains a device acceptance check.
