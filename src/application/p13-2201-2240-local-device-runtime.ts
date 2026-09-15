export type DeviceClass = "PC" | "TABLET" | "SMARTPHONE";
export type RuntimeMode = "SERVER" | "LOCAL" | "CLIENT";

export type LocalDeviceRuntime = Readonly<{
  deviceId: string;
  deviceClass: DeviceClass;
  mode: RuntimeMode;
  applicationVersion: string;
  offlineCapable: true;
  syntheticOnly: true;
}>;

export function composeLocalDeviceRuntime(input: LocalDeviceRuntime): LocalDeviceRuntime {
  if (!input.deviceId.trim() || !input.applicationVersion.trim()) {
    throw new Error("LOCAL_DEVICE_RUNTIME_IDENTITY_REQUIRED");
  }
  if (!input.offlineCapable || !input.syntheticOnly) {
    throw new Error("LOCAL_DEVICE_RUNTIME_GOVERNANCE_REQUIRED");
  }
  return input;
}

export function assertClientCanUseLocalRuntime(runtime: LocalDeviceRuntime): void {
  if (runtime.mode !== "CLIENT" && runtime.mode !== "LOCAL") {
    throw new Error("LOCAL_RUNTIME_MODE_REQUIRED");
  }
}
