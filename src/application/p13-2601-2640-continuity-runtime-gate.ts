import type { LocalServerBootstrap } from "./p13-2441-2480-local-server-bootstrap.js";
import { assertLocalServerReady } from "./p13-2441-2480-local-server-bootstrap.js";
import type { LanClient } from "./p13-2481-2520-lan-client-discovery.js";
import type { DurableSyncJournalEntry } from "./p13-2521-2560-durable-sync-journal.js";
import type { BackupRotationPolicy } from "./p13-2561-2600-backup-rotation.js";

export type ContinuityRuntimeDecision = "BLOCKED" | "READY";

export type ContinuityRuntimeInput = Readonly<{
  server: LocalServerBootstrap;
  clients: readonly LanClient[];
  journalEntries: readonly DurableSyncJournalEntry[];
  backupPolicy: BackupRotationPolicy;
  verifiedRestoreAvailable: boolean;
}>;

export function evaluateContinuityRuntime(input: ContinuityRuntimeInput): ContinuityRuntimeDecision {
  try { assertLocalServerReady(input.server); } catch { return "BLOCKED"; }
  if (input.clients.some((client) => !client.trusted)) return "BLOCKED";
  if (input.journalEntries.some((entry) => entry.state === "BLOCKED")) return "BLOCKED";
  if (!input.backupPolicy.syntheticOnly || !input.verifiedRestoreAvailable) return "BLOCKED";
  return "READY";
}
