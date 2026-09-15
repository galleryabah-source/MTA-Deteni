export type DeviceClass = "DESKTOP" | "TABLET" | "SMARTPHONE";

export type ResponsiveInvariant = Readonly<{
  deviceClass: DeviceClass;
  navigationMode: "SIDEBAR" | "COMPACT" | "BOTTOM_ACTIONS";
  minimumTouchTargetPx: 44;
  requiresHorizontalScroll: false;
}>;

export const RESPONSIVE_INVARIANTS: Readonly<Record<DeviceClass, ResponsiveInvariant>> = {
  DESKTOP: { deviceClass: "DESKTOP", navigationMode: "SIDEBAR", minimumTouchTargetPx: 44, requiresHorizontalScroll: false },
  TABLET: { deviceClass: "TABLET", navigationMode: "COMPACT", minimumTouchTargetPx: 44, requiresHorizontalScroll: false },
  SMARTPHONE: { deviceClass: "SMARTPHONE", navigationMode: "BOTTOM_ACTIONS", minimumTouchTargetPx: 44, requiresHorizontalScroll: false },
};

export type NavigationSurface = "DASHBOARD" | "DETAINEE" | "MOVEMENT" | "TEMPORARY_EXIT" | "QR" | "REPORTS" | "PERKES" | "SUBBAG_TU";
export type ApplicationRole = "OWNER" | "ADMIN" | "EDITOR" | "REVIEWER" | "AUDITOR";

const ROLE_SURFACES: Readonly<Record<ApplicationRole, readonly NavigationSurface[]>> = {
  OWNER: ["DASHBOARD", "DETAINEE", "MOVEMENT", "TEMPORARY_EXIT", "QR", "REPORTS", "PERKES", "SUBBAG_TU"],
  ADMIN: ["DASHBOARD", "DETAINEE", "MOVEMENT", "TEMPORARY_EXIT", "QR", "REPORTS", "PERKES", "SUBBAG_TU"],
  EDITOR: ["DASHBOARD", "DETAINEE", "MOVEMENT", "TEMPORARY_EXIT", "QR", "REPORTS"],
  REVIEWER: ["DASHBOARD", "DETAINEE", "MOVEMENT", "TEMPORARY_EXIT", "QR", "REPORTS"],
  AUDITOR: ["DASHBOARD", "DETAINEE", "MOVEMENT", "TEMPORARY_EXIT", "QR", "REPORTS"],
};

export function navigationForRole(role: string): readonly NavigationSurface[] {
  if (!(role in ROLE_SURFACES)) return [];
  return ROLE_SURFACES[role as ApplicationRole];
}

export function assertNavigationAllowed(role: string, surface: NavigationSurface): void {
  if (!navigationForRole(role).includes(surface)) throw new Error(`Navigation denied: ${role}:${surface}`);
}

export type LanDeviceIdentity = Readonly<{
  deviceId: string;
  installationId: string;
  networkScopeId: string;
  deviceClass: DeviceClass;
}>;

export function assertLanDeviceIdentity(identity: LanDeviceIdentity): void {
  for (const [name, value] of Object.entries(identity)) {
    if (!value.trim()) throw new Error(`LAN device identity requires ${name}.`);
  }
}

export type LocalServiceBoundary = Readonly<{
  serviceId: string;
  listenScope: "LAN_ONLY" | "LOOPBACK_ONLY";
  allowsInternetExposure: false;
  requiresAuthenticatedDevice: true;
}>;

export const DEFAULT_LOCAL_SERVICE_BOUNDARY: LocalServiceBoundary = {
  serviceId: "mta-local-runtime",
  listenScope: "LAN_ONLY",
  allowsInternetExposure: false,
  requiresAuthenticatedDevice: true,
};

export function assertLocalServiceBoundary(boundary: LocalServiceBoundary): void {
  if (boundary.allowsInternetExposure) throw new Error("Local service must fail closed against internet exposure.");
  if (!boundary.requiresAuthenticatedDevice) throw new Error("Local service requires authenticated device identity.");
}
