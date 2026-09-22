import { mkdir, writeFile } from "node:fs/promises";
import { assertRuntimeExecutionContext, assertRuntimeHandoffSafety, bindRuntimeToLifecycle, bindRuntimeToRecovery, createRuntimeHandoff } from "../src/application/runtime-execution-boundary.js";
import { resolveRuntimeCapabilities } from "../src/application/runtime-continuity.js";
import { RESPONSIVE_INVARIANTS } from "../src/application/runtime-surface.js";

const lifecycle = Object.freeze({ journeyId: "LIFECYCLE-SYN-0001", syntheticOnly: true });
const recovery = Object.freeze({ journeyId: "RECOVERY-SYN-0001", syntheticOnly: true });

const cloud = resolveRuntimeCapabilities("CLOUD", "DESKTOP");
const lan = resolveRuntimeCapabilities("LAN", "TABLET");
const local = resolveRuntimeCapabilities("LOCAL", "SMARTPHONE");

for (const capabilities of [cloud, lan, local]) {
  const context = Object.freeze({
    executionId: `EXEC-${capabilities.mode}-${capabilities.device}`,
    runtimeMode: capabilities.mode,
    deviceClass: capabilities.device,
    networkScopeId: `NET-${capabilities.mode}`,
    certificationJourneyId: capabilities.mode === "CLOUD" ? lifecycle.journeyId : recovery.journeyId,
    authenticated: true,
    syntheticOnly: true,
  });
  assertRuntimeExecutionContext(context, capabilities);
  if (capabilities.mode === "CLOUD") bindRuntimeToLifecycle(context, lifecycle);
  else bindRuntimeToRecovery(context, recovery);
}

const handoff = createRuntimeHandoff({
  executionId: "HANDOFF-SYN-0001",
  fromMode: "LAN",
  toMode: "CLOUD",
  fromDeviceId: "DEV-TABLET-SYN",
  toDeviceId: "DEV-DESKTOP-SYN",
  fromNetworkScopeId: "NET-LAN-SYN",
  toNetworkScopeId: "NET-CLOUD-SYN",
  authorizationId: "AUTH-HANDOFF-SYN-0001",
  queuePending: true,
});
assertRuntimeHandoffSafety(handoff);
if (!handoff.reconciliationRequired || !handoff.authorizationRequired || !handoff.certificationBound) throw new Error("Runtime handoff did not enforce reconciliation/authorization/certification.");

for (const device of ["DESKTOP", "TABLET", "SMARTPHONE"] as const) {
  const invariant = RESPONSIVE_INVARIANTS[device];
  if (invariant.minimumTouchTargetPx !== 44 || invariant.requiresHorizontalScroll) throw new Error(`Responsive invariant failed for ${device}.`);
}

await mkdir("artifacts/mta-evidence", { recursive: true });
await writeFile("artifacts/mta-evidence/runtime-device-handoff.json", JSON.stringify({
  executionId: process.env.GITHUB_RUN_ID ?? "local",
  commitSha: process.env.GITHUB_SHA ?? "local",
  environment: process.env.MTA_EXECUTION_ENV ?? "controlled-nonprod",
  syntheticOnly: true,
  productionAccessAuthorized: false,
  migrationExecuted: false,
  aiEnabled: false,
  runtimeModes: {
    CLOUD_DESKTOP: cloud,
    LAN_TABLET: lan,
    LOCAL_SMARTPHONE: local,
  },
  handoff,
  responsiveInvariants: RESPONSIVE_INVARIANTS,
  result: "PASS",
}, null, 2) + "\n", "utf8");
console.log("RUNTIME_DEVICE_HANDOFF=PASS");
