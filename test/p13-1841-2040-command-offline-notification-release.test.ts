import test from "node:test";
import assert from "node:assert/strict";
import { buildCommandUxIntent } from "../src/application/p13-1841-1880-command-ux.js";
import { evaluateOfflineSafety } from "../src/application/p13-1881-1920-offline-degraded-safety.js";
import { composeNotificationCenter, acknowledgeNotification } from "../src/application/p13-1921-1960-notification-center.js";
import { buildAlertAcknowledgement } from "../src/application/p13-1961-2000-operational-alert-ack.js";
import { composeSyntheticReleaseTrace, assertSyntheticReleaseTrace } from "../src/application/p13-2001-2040-synthetic-release-trace.js";

test("P13.1841-2040: command, offline, notification and release trace remain governed", () => {
  assert.throws(() => buildCommandUxIntent({ commandId: "mut-1", section: "MOVEMENT", label: "Mutate", requiresConfirmation: false, mutation: true }), /COMMAND_UX_MUTATION_CONFIRMATION_REQUIRED/);
  assert.equal(evaluateOfflineSafety("OFFLINE").allowMutation, false);
  const item = { notificationId: "n-1", subject: "Synthetic alert", priority: "WARNING" as const, sourceEvidenceId: "ev-1", recipientRole: "KAMTIB", createdAt: "2026-09-15T10:00:00Z", acknowledged: false };
  const acknowledged = acknowledgeNotification(composeNotificationCenter([item])[0]);
  const ack = buildAlertAcknowledgement(acknowledged, "operator-1", "2026-09-15T10:01:00Z");
  assert.equal(ack.evidenceId, item.sourceEvidenceId);
  const trace = composeSyntheticReleaseTrace("trace-1");
  assertSyntheticReleaseTrace(trace);
  assert.equal(trace.productionAuthorized, false);
});
