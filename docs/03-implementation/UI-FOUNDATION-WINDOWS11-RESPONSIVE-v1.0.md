# MTA DETENI — UI Foundation: Windows 11-Inspired Responsive Design v1.0

## 1. Objective

Define the frontend foundation for MTA DETENI Digital with a Windows 11-inspired visual language while keeping the client lightweight, responsive, accessible, and suitable for desktop, smartphone, and tablet use.

The UI is a presentation layer only. Security, authorization, workflow state, validation, audit, and business rules remain server-side.

## 2. Design Principles

1. **Light client, strong server** — minimal JavaScript, no heavy UI runtime unless justified.
2. **Responsive by default** — one application adapts to desktop, tablet, and smartphone.
3. **Dynamic composition** — navigation, widgets, tables, forms, and dashboard cards can reflow without changing domain logic.
4. **Touch first on small screens** — minimum comfortable hit targets, swipe-friendly panels, no hover dependency.
5. **Progressive disclosure** — show essential operational information first; secondary information is expandable.
6. **Accessibility** — keyboard navigation, visible focus, semantic HTML, reduced-motion support, readable contrast.
7. **Server authority** — UI never decides permission; it consumes authorization decisions from the backend.
8. **Synthetic data only in repository** — the prototype contains no operational detainee data.

## 3. Visual Language

Use a restrained Windows 11-inspired system:

- rounded surfaces, subtle borders and shadows;
- translucent/acrylic-inspired surfaces only where inexpensive;
- neutral background with restrained accent color;
- compact command/navigation areas;
- Fluent-style iconography can be represented by inline SVG or an approved icon set;
- avoid cloning Microsoft's proprietary assets or exact application screens.

### Design tokens

```css
--mta-bg: #f5f7fb;
--mta-surface: #ffffff;
--mta-surface-muted: #eef2f7;
--mta-border: #d9e0ea;
--mta-text: #172033;
--mta-text-muted: #667085;
--mta-accent: #2563eb;
--mta-success: #15803d;
--mta-warning: #b45309;
--mta-danger: #b91c1c;
--mta-radius-sm: 8px;
--mta-radius-md: 12px;
--mta-radius-lg: 16px;
--mta-shadow-sm: 0 1px 2px rgb(15 23 42 / 0.06);
--mta-shadow-md: 0 8px 24px rgb(15 23 42 / 0.08);
```

Tokens are implementation guidance; final values can be changed centrally without changing domain code.

## 4. Application Shell

```text
┌─────────────────────────────────────────────────────────────┐
│ MTA DETENI     Search                 Alerts  User           │
├───────────────┬─────────────────────────────────────────────┤
│ Navigation    │ Page header                                 │
│               │ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│ Dashboard     │ │ KPI     │ │ KPI     │ │ KPI     │         │
│ Deteni        │ └─────────┘ └─────────┘ └─────────┘         │
│ Penempatan    │                                             │
│ Pergerakan    │ Main operational workspace                  │
│ Izin Keluar   │                                             │
│ Pengawalan    │                                             │
│ Dokumen       │                                             │
│ Laporan       │                                             │
│ Audit         │                                             │
│ Pengaturan    │                                             │
└───────────────┴─────────────────────────────────────────────┘
```

Desktop uses a collapsible side navigation. Tablet can use a compact rail. Smartphone uses a top bar plus bottom/overlay navigation.

## 5. Responsive Breakpoints

The exact breakpoint values remain centralized in the UI layer.

| Class | Target | Behavior |
|---|---|---|
| `mobile` | small phones | single-column, stacked cards, compact toolbar |
| `tablet` | phones/tablets landscape | 2-column where useful, collapsible navigation |
| `desktop` | laptop/desktop | full navigation, multi-column dashboard |
| `wide` | large displays | bounded content width, no excessive stretching |

Do not create separate mobile and desktop applications. Use the same components and domain routes.

## 6. Mobile Rules

- No horizontal page scrolling for normal workflows.
- Tables transform to cards or horizontally scroll only when the tabular structure is materially necessary.
- Primary action stays reachable with one hand where practical.
- Forms use one column by default.
- Date/time controls use native mobile-friendly controls where appropriate.
- QR/barcode scanning workflow gets a dedicated full-width action surface.
- Critical confirmation dialogs remain explicit and do not rely on color alone.

## 7. Tablet Rules

Tablet is treated as a first-class operational device, not a scaled-down desktop.

- compact navigation rail;
- split view for list/detail workflows where width permits;
- touch-friendly command bars;
- landscape and portrait reflow;
- persistent context for active detainee/operational record.

## 8. Component Architecture

```text
UI Shell
├── AppHeader
├── Navigation
├── CommandBar
├── Breadcrumbs
├── PageHeader
├── StatusCard
├── DataTable / DataCards
├── FilterBar
├── DetailPanel
├── FormSection
├── Timeline
├── QRScannerSurface
├── ConfirmationDialog
├── Toast / InlineNotice
└── EmptyState
```

Components must remain domain-agnostic where possible. Domain workflows compose them rather than embedding business rules in visual components.

## 9. Dynamic Dashboard

Dashboard widgets are configuration-driven:

```text
widget registry
    ↓
permission-aware server response
    ↓
user layout preferences
    ↓
responsive renderer
```

Users may rearrange or hide non-critical widgets. Security-sensitive widgets cannot be surfaced merely by changing client preferences.

## 10. Performance Budget

Initial UI should remain lightweight:

- no large component framework solely for visual effects;
- no client-side data duplication when server rendering or targeted API requests suffice;
- lazy-load heavy workflows such as document preview or QR scanning;
- avoid unnecessary animation;
- use CSS for layout and visual effects;
- prefer SVG/CSS icons over large image assets;
- virtualize genuinely large lists rather than rendering thousands of rows.

Target: fast first render on ordinary Android devices and office desktops on constrained networks.

## 11. Backend Contract

The frontend communicates through typed API/application contracts:

```text
UI
 ↓
API / Server Action boundary
 ↓
Authentication
 ↓
Authorization
 ↓
Domain/Application Service
 ↓
PostgreSQL / Storage / Outbox
```

The browser never receives database credentials and never becomes the authority for role, scope, duty, or workflow state.

## 12. Security UI Contract

- Hide unavailable navigation where appropriate, but never rely on hiding for authorization.
- Server returns authoritative `allowed/denied` decisions.
- Sensitive fields are rendered only when returned by the authorized backend response.
- Error messages are operationally useful but must not disclose security-sensitive internals.
- Audit references can be displayed without exposing restricted audit content.

## 13. User Customization

Supported preferences should be non-security-sensitive:

- theme/light-dark/system;
- compact/comfortable density;
- navigation collapsed/expanded;
- dashboard widget order;
- visible non-critical widgets;
- table column visibility;
- preferred landing page where policy allows.

Preferences are presentation state, not authorization state.

## 14. Accessibility

Minimum baseline:

- semantic landmarks;
- labels for all form controls;
- keyboard access;
- visible focus states;
- `aria-live` for important async status changes;
- reduced motion support;
- status represented by text/icon in addition to color;
- adequate contrast;
- touch targets appropriate for mobile use.

## 15. Initial Prototype Scope

The first UI prototype should contain only synthetic operational examples:

1. Dashboard shell.
2. Navigation collapse/expand.
3. Responsive KPI cards.
4. Deteni list with mobile card transformation.
5. Deteni detail panel.
6. Operational status/timeline.
7. QR action surface placeholder.
8. User preference controls for density/theme/layout.

No real authentication, real detainee records, production QR values, or production integrations are included in the prototype.

## 16. Acceptance Criteria

- UI works at phone, tablet, and desktop widths.
- No dependency on hover for essential actions.
- Navigation is usable with touch and keyboard.
- Dashboard reflows without layout breakage.
- List/detail workflow remains understandable on a phone.
- UI assets remain small and locally controlled.
- Prototype uses synthetic data only.
- UI does not contain authorization logic as the security authority.
- Design tokens can be changed centrally.
- Backend can later be replaced/connected without rewriting the visual system.
