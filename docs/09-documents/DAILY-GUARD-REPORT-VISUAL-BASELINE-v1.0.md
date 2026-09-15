# MTA DETENI — Daily Guard Report Visual Baseline v1.0

## Source

This baseline is derived from the sanitized reference PDF supplied for design analysis: an 11-page Daily Guard Team Report for a morning Bravo duty team dated 11 September 2026.

## Confirmed Canvas

- page count: 11;
- page size: 1440 × 810 points in the supplied PDF;
- orientation: landscape;
- aspect ratio: 16:9.

The 16:9 landscape canvas is therefore the initial renderer target. Production implementation must re-check the dimensions from the formally approved template asset before locking renderer coordinates.

## Visual Pattern

The reference consistently uses:

- a dark institutional header band;
- institutional identity/logo area;
- large uppercase section titles;
- a photographic/background layer with transparency/watermark treatment;
- strong horizontal separators;
- large photo frames for activity evidence;
- body narrative below/around the photo composition;
- distinct signature/closing composition;
- a final regu-specific closing page.

## Page-by-Page Baseline

### Page 1 — Cover

Contains institutional identity, report title, regu/shift identity, date and duty time, plus a prominent building photograph.

### Page 2 — Addressee

Contains the approved recipient/addressee block over the institutional visual background.

### Page 3 — Team Handover

Contains handover narrative, team composition, commander, members, support/security and supporting photographs.

### Page 4 — Detainee Block Checking/Control

Contains activity time, operational narrative, headcount/composition and supporting photograph(s).

### Page 5 — Guard-Post Readiness

Contains guard/CCTV/post activity, security result and supporting photograph(s).

### Page 6 — Detainee Activity Supervision

Contains supervision narrative, results and supporting photograph(s).

### Page 7 — Special Escort/Activity

Contains escort narrative and supporting photograph(s).

### Page 8 — Meal Distribution/Service

Contains inspection/distribution narrative and supporting photograph(s).

### Page 9 — End-of-Shift Handover

Contains time, outgoing/incoming regu, joint control, condition and supporting photograph(s).

### Page 10 — Closing and Signatures

Contains closing statement, place/date, commander and supervisory signatory blocks.

### Page 11 — Closing Page

Contains institutional closing artwork/text and the active regu identity.

## Coordinate Strategy

Do not hard-code coordinates from the example PDF as production truth. Instead:

1. register the approved template asset;
2. define named regions/slots;
3. record each region's coordinates in the template version metadata;
4. bind data fields to named slots;
5. run rendered-page regression tests;
6. approve the resulting template version.

This permits a future official template revision without rewriting the report domain model.

## Fidelity Levels

### Level 1 — Structural fidelity

Correct page count/order, sections and required content.

### Level 2 — Layout fidelity

Correct dimensions, region geometry, typography hierarchy, photo frames, separators and signature blocks.

### Level 3 — Visual fidelity

Approved logos/artwork, background treatment, font assets and image composition match the approved reference/template.

### Level 4 — Regression fidelity

Rendered output passes automated image/layout regression within documented renderer tolerances.

Production acceptance targets Level 4 for every ACTIVE template version.

## Asset Governance

Official logos, signatures, photographs and institutional artwork must be supplied through an authorized asset process. They must not be copied into GitHub when restricted or operationally sensitive.

The repository may contain synthetic placeholders and test fixtures only.
