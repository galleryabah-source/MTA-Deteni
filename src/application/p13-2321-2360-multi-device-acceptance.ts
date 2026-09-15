import type { DeviceClass, LocalDeviceRuntime } from "./p13-2201-2240-local-device-runtime.js";

export type MultiDeviceAcceptance = Readonly<{
  acceptanceId: string;
  devices: readonly LocalDeviceRuntime[];
  requiredClasses: readonly DeviceClass[];
  syntheticOnly: true;
}>;

export function composeMultiDeviceAcceptance(input: MultiDeviceAcceptance): MultiDeviceAcceptance {
  if (!input.acceptanceId.trim()) throw new Error("MULTI_DEVICE_ACCEPTANCE_ID_REQUIRED");
  if (input.devices.length === 0) throw new Error("MULTI_DEVICE_DEVICES_REQUIRED");
  if (!input.syntheticOnly) throw new Error("MULTI_DEVICE_SYNTHETIC_ONLY_REQUIRED");
  const classes = new Set(input.devices.map((device) => device.deviceClass));
  for (const required of input.requiredClasses) {
    if (!classes.has(required)) throw new Error("MULTI_DEVICE_CLASS_MISSING");
  }
  return input;
}

export function assertSyntheticMultiDeviceAcceptance(input: MultiDeviceAcceptance): void {
  composeMultiDeviceAcceptance(input);
  if (input.devices.some((device) => !device.syntheticOnly)) {
    throw new Error("MULTI_DEVICE_REAL_DATA_BLOCKED");
  }
}
