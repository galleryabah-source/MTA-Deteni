# MTA DETENI — Desktop UI Hardening v2

## Scope

Desktop-only hardening for the responsive shell. The desktop contract starts at `min-width: 1025px`; tablet and phone continue to use the existing mobile/tablet shell.

## Implemented

- Grouped desktop navigation without changing the underlying `data-view` contract.
- Desktop navigation accessibility metadata (`aria-label`, `aria-current`, button titles).
- Keyboard-visible focus treatment for navigation and collapse controls.
- Desktop runtime status strip reflecting the governed synthetic-only runtime boundary.
- Desktop dashboard/card/table visual density refinement.
- Sticky table headers on desktop for long operational tables.
- Explicit default hiding of the mobile bottom navigation and mobile menu outside the mobile/tablet breakpoint.
- Offline shell cache version bumped so the desktop/mobile boundary fix is propagated to existing service-worker clients.

## Desktop regression matrix

The device regression workflow covers:

- 390×844 phone
- 768×1024 tablet
- 1440×900 desktop
- 1920×1080 desktop HD

The desktop contract verifies:

- desktop enhancement is active;
- left sidebar is visible;
- mobile bottom navigation is not visible;
- desktop navigation groups are present;
- desktop runtime status strip is present;
- desktop navigation contains the expected extended module surface;
- sidebar collapse control exists and collapses the sidebar;
- no horizontal document overflow is introduced.

## Governance boundary

This UI hardening does not change database schema, migrations, authentication policy, production authorization, AI state, or detainee data handling. Repository data remains synthetic-only.

## Current validation note

The browser device matrix for the current `main` commit passed for phone, tablet, 1440×900 desktop, and 1920×1080 desktop HD. Cloudflare's Workers Build check also completed successfully for the current commit.

The separate `domain-ci` remains red because of pre-existing P13 TypeScript test-contract drift; that failure is outside the desktop UI hardening scope and must not be represented as a UI regression failure.
