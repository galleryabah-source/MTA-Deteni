import { mkdir, writeFile } from "node:fs/promises";
import { PlacementService } from "../src/domain/placement/service.js";
import { MovementService } from "../src/domain/movement/service.js";
import { enqueueOfflineCommand, reconcileOfflineCommand } from "../src/application/offline-continuity.js";
import { evaluateQrValidityWindow, isContextCompatible } from "../src/application/p11-449-544-qr-validity.js";
import { buildDailyGuardReportJourney } from "../src/application/daily-guard-report-journey.js";
import { aggregateDailyGuardReport, validateDailyGuardReportAggregation } from "../src/application/daily-guard-report-aggregation.js";
import { validateAuditOutboxCorrelation, sameCorrelation } from "../src/application/p11-873-904-audit-outbox-correlation.js";
import { certifyIntegratedAcceptance } from "../src/application/integrated-acceptance-journey.js";
import type { ActorContext } from "../src/domain/shared/contracts.js";
import type { ReportSnapshot } from "../src/application/report-artifact.js";

const now = "2026-09-22T02:00:00.000Z";
const journeyId = "IAJ-RUNTIME-SYN-0001";
const detaineeId = "SYN-DET-RUNTIME-0001";
const correlationId = "CORR-RUNTIME-SYN-0001";
const actor: ActorContext = Object.freeze({
  actorId: "SYN-ACTOR-KAMTIB-0001",
  role: "OPERATOR",
  domain: "KAMTIB",
  scope: Object.freeze({ unit: "SYNTHETIC" }),
  correlationId,
});

const placements = new Map<string, any>();
const beds = new Map<string, string>();
const movements: any[] = [];

const placement = new PlacementService({
  repository: {
    getCurrent: async (id) => placements.get(id) ?? null,
    getBedOccupant: async (bedId) => beds.get(bedId) ?? null,
    save: async (value) => {
      placements.set(value.detaineeId, value);
      if (value.active) beds.set(value.bedId, value.detaineeId);
    },
  },
  now: () => now,
  canManage: (a) => a.domain === "KAMTIB",
});

const movement = new MovementService({
  repository: {
    append: async (event) => { movements.push(event); },
    listSince: async (id) => movements.filter((event) => event.detaineeId === id),
  },
  now: () => now,
  canManage: (a) => a.domain === "KAMTIB",
});

await placement.assign({ detaineeId, blockId: "SYN-BLOCK-RUNTIME", roomId: "SYN-ROOM-RUNTIME", bedId: "SYN-BED-RUNTIME", actor });
await movement.record({ id: "SYN-MOV-RUNTIME-IN", detaineeId, type: "IN", toPlacementRef: "SYN-BED-RUNTIME", actor });

const offlineCommand = enqueueOfflineCommand({
  commandId: "SYN-OFF-RUNTIME-0001",
  aggregateId: detaineeId,
  commandType: "MOVEMENT_RECORD",
  payloadHash: "HASH-RUNTIME-0001",
  idempotencyKey: "IDEMP-RUNTIME-0001",
  createdAt: now,
});
const offlineDecision = reconcileOfflineCommand({
  command: offlineCommand,
  existingIdempotencyKeys: [],
  aggregateRevisionMatches: true,
}).action;
if (offlineDecision !== "APPLY") throw new Error(`Unexpected offline decision: ${offlineDecision}`);
const replayDecision = reconcileOfflineCommand({
  command: offlineCommand,
  existingIdempotencyKeys: [offlineCommand.idempotencyKey],
  aggregateRevisionMatches: true,
}).action;
if (replayDecision !== "SKIP_DUPLICATE") throw new Error(`Unexpected replay decision: ${replayDecision}`);

const qr = evaluateQrValidityWindow({
  checkpoint: "SYN-CHECKPOINT-RUNTIME",
  context: "RUDENIM_STAY",
  state: "ACTIVE",
  validFrom: "2026-09-22T01:00:00.000Z",
  validUntil: "2026-09-22T03:00:00.000Z",
  scannedAt: now,
});
if (qr !== "ACCEPTED" || !isContextCompatible("RUDENIM_STAY", "RUDENIM_STAY")) throw new Error("QR runtime acceptance failed.");

const aggregation = aggregateDailyGuardReport({
  reportDate: "2026-09-22",
  generatedAt: now,
  detainees: [{ id: detaineeId, status: "AKTIF" }],
  rooms: [{ id: "SYN-ROOM-RUNTIME", block: "SYN-BLOCK-RUNTIME", room: "SYN-ROOM-RUNTIME", capacity: 1 }],
  placements: [{ detaineeId, roomId: "SYN-ROOM-RUNTIME", active: true }],
  movements: movements.map((event) => ({ id: event.id, detaineeId: event.detaineeId, type: event.type, occurredAt: now })),
  leaves: [],
  incidents: [],
});
validateDailyGuardReportAggregation(aggregation);
const sections = Object.freeze({
  IDENTITAS_LAPORAN: `Laporan Harian Regu Jaga — ${aggregation.reportDate}`,
  PERSONEL_REGU: "Regu Synthetic Runtime",
  KONDISI_DETENI: `Deteni aktif: ${aggregation.totals.detaineesActive}; penempatan aktif: ${aggregation.totals.placementsActive}`,
  KEGIATAN_JAGA: `Pergerakan hari ini: ${aggregation.totals.movementsToday} (IN ${aggregation.totals.movementsIn}, OUT ${aggregation.totals.movementsOut})`,
  KEJADIAN_PENTING: `Kejadian hari ini: ${aggregation.totals.incidentsToday}; terbuka: ${aggregation.totals.incidentsOpen}`,
  SERAH_TERIMA: `Kamar terisi: ${aggregation.totals.roomsOccupied}/${aggregation.totals.roomsTotal}`,
  PENGESAHAN: "Pengesahan synthetic runtime — agregasi tervalidasi",
});
const sectionOrder = Object.keys(sections);
const snapshot: ReportSnapshot = Object.freeze({
  snapshotId: "REPORT-RUNTIME-SYN-0001",
  sourceVersion: journeyId,
  documentNumber: "LHR/SYN/RUNTIME/0001",
  approvalBinding: "APPROVAL-RUNTIME-SYN-0001",
  provenance: Object.freeze(["synthetic-runtime"]),
  sections,
});
const report = buildDailyGuardReportJourney({
  snapshot,
  sectionOrder,
  previewId: "PREVIEW-RUNTIME-SYN-0001",
  downloadId: "DOWNLOAD-RUNTIME-SYN-0001",
});
if (!report.download.content.includes("[PENGESAHAN]")) throw new Error("Daily Guard Report runtime rendering failed.");

const correlation = Object.freeze({
  correlationId,
  auditEventId: "AUDIT-RUNTIME-SYN-0001",
  outboxMessageId: "OUTBOX-RUNTIME-SYN-0001",
  aggregateId: detaineeId,
  topic: "mta.synthetic.runtime",
});
if (validateAuditOutboxCorrelation(correlation) !== "READY") throw new Error("Audit/outbox correlation is not ready.");
if (!sameCorrelation(correlation, { ...correlation, outboxMessageId: "OUTBOX-RUNTIME-SYN-0002" })) throw new Error("Correlation identity unexpectedly drifted.");

const result = certifyIntegratedAcceptance({
  journeyId,
  syntheticOnly: true,
  domainReady: movements.length === 1 && placements.get(detaineeId)?.active === true,
  offlineReconnectReady: offlineDecision === "APPLY" && replayDecision === "SKIP_DUPLICATE",
  qrReady: qr === "ACCEPTED",
  reportReady: report.syntheticOnly === true && report.download.documentNumber === snapshot.documentNumber,
  auditOutboxReady: validateAuditOutboxCorrelation(correlation) === "READY",
  lifecycleJourneyId: "LIFECYCLE-RUNTIME-SYN-0001",
  offlineSessionId: "OFFLINE-RUNTIME-SYN-0001",
  reportSnapshotId: snapshot.snapshotId,
  qrSubjectId: detaineeId,
  auditCorrelationId: correlation.correlationId,
  outboxCorrelationId: correlation.correlationId,
});

await mkdir("artifacts/mta-evidence", { recursive: true });
await writeFile(
  "artifacts/mta-evidence/integrated-acceptance-runtime.json",
  JSON.stringify({
    version: result.version,
    executionId: process.env.GITHUB_RUN_ID ?? "local",
    commitSha: process.env.GITHUB_SHA ?? "local",
    environment: process.env.MTA_EXECUTION_ENV ?? "controlled-nonprod",
    syntheticOnly: true,
    productionAccessAuthorized: false,
    migrationExecuted: false,
    aiEnabled: false,
    journey: result,
    observations: {
      domain: { placementActive: placements.get(detaineeId)?.active === true, movementCount: movements.length },
      offlineReconnect: { firstDecision: offlineDecision, replayDecision },
      qr: { outcome: qr, contextCompatible: true },
      dailyGuardReport: { snapshotId: snapshot.snapshotId, documentNumber: report.download.documentNumber, aggregationVersion: aggregation.version, totals: aggregation.totals, validated: true },
      auditOutbox: { correlationId, validation: "READY" },
    },
  }, null, 2) + "\n",
  "utf8",
);
console.log("INTEGRATED_ACCEPTANCE_RUNTIME=PASS");
