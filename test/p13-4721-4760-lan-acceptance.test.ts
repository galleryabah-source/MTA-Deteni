import test from "node:test";
import assert from "node:assert/strict";
import { assertLanAcceptanceEvidence } from "../src/application/p13-4721-4760-lan-acceptance-evidence";

test("LAN acceptance evidence requires observed passing scenarios", () => {
  const observations = [
    { scenario: "LOCAL_SERVER_READY" as const, deviceId: "PC-SERVER", serverId: "LOCAL-001", evidenceId: "E-LAN-1", outputIdentity: "O-LAN-1", observed: true, passed: true },
    { scenario: "TRUSTED_TABLET" as const, deviceId: "TAB-001", serverId: "LOCAL-001", evidenceId: "E-LAN-2", outputIdentity: "O-LAN-2", observed: true, passed: true },
    { scenario: "TRUSTED_SMARTPHONE" as const, deviceId: "PHONE-001", serverId: "LOCAL-001", evidenceId: "E-LAN-3", outputIdentity: "O-LAN-3", observed: true, passed: true },
    { scenario: "OFFLINE_RECONNECT" as const, deviceId: "TAB-001", serverId: "LOCAL-001", evidenceId: "E-LAN-4", outputIdentity: "O-LAN-4", observed: true, passed: true },
  ];
  assert.doesNotThrow(() => assertLanAcceptanceEvidence(observations));
  assert.throws(() => assertLanAcceptanceEvidence([{ ...observations[0], observed: false }]), /LAN_ACCEPTANCE_NOT_OBSERVED/);
  assert.throws(() => assertLanAcceptanceEvidence([{ ...observations[0], passed: false }]), /LAN_ACCEPTANCE_FAILED/);
});
