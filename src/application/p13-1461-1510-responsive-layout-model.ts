import type { UiDensity, UiViewport } from "./p13-1401-1460-operator-ui-contract.js";

export type LayoutMode = "SINGLE_COLUMN" | "ADAPTIVE_TWO_COLUMN" | "MULTI_PANEL";

export type ResponsiveLayoutModel = Readonly<{
  viewport: UiViewport;
  mode: LayoutMode;
  density: UiDensity;
  sidebar: "COLLAPSED" | "VISIBLE";
  bottomNavigation: boolean;
  stickyActions: boolean;
}>;

export function resolveResponsiveLayout(viewport: UiViewport, density: UiDensity): ResponsiveLayoutModel {
  if (viewport === "PHONE") return { viewport, mode: "SINGLE_COLUMN", density, sidebar: "COLLAPSED", bottomNavigation: true, stickyActions: true };
  if (viewport === "TABLET") return { viewport, mode: "ADAPTIVE_TWO_COLUMN", density, sidebar: "COLLAPSED", bottomNavigation: false, stickyActions: true };
  return { viewport, mode: "MULTI_PANEL", density, sidebar: "VISIBLE", bottomNavigation: false, stickyActions: false };
}
