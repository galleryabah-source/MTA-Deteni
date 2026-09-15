export type RuntimeMode = "CLOUD" | "LAN" | "LOCAL";
export type DeviceClass = "DESKTOP" | "TABLET" | "SMARTPHONE";

export type RuntimeCapabilities = Readonly<{
  mode: RuntimeMode;
  device: DeviceClass;
  offlineWrites: boolean;
  localBackup: boolean;
  multiDeviceLan: boolean;
}>;

export function resolveRuntimeCapabilities(mode: RuntimeMode, device: DeviceClass): RuntimeCapabilities {
  return Object.freeze({
    mode,
    device,
    offlineWrites: mode !== "CLOUD",
    localBackup: mode === "LAN" || mode === "LOCAL",
    multiDeviceLan: mode === "LAN",
  });
}

export function assertRuntimeSafety(capabilities: RuntimeCapabilities): void {
  if (capabilities.mode === "CLOUD" && capabilities.localBackup) throw new Error("Cloud mode cannot claim local backup capability.");
  if (capabilities.mode === "LOCAL" && !capabilities.offlineWrites) throw new Error("Local mode requires offline-write continuity.");
}
