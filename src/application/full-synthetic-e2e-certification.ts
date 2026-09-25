import { verifyQrScan, type QrVerificationResult } from "./qr-scan-result.js";
import { createExecutionContext, type ExecutionContext } from "./execution-context-contract.js";
import { executeCriticalMutation, type MutationAuditRecord, type MutationIntegrationStores } from "./mutation-integration.js";
import type { IdempotencyRecord } from "./idempotency-contract.js";
import type { OutboxEventContract } from "./outbox-runtime-contract.js";
import type { TransactionRunner } from "./transaction-contract.js";
import { collectMfeEvidenceToCanonicalDataset, canonicalDatasetToDailyGuardWebReportInput } from "./mfe-canonical-daily-report-runtime-adapter.js";
import type { CanonicalDailyDataset } from "./canonical-daily-dataset-contract.js";

export const FULL_SYNTHETIC_E2E_VERSION = "FULL-SYNTHETIC-E2E-v1";

export type FullSyntheticE2EInput = Readonly<{
  journeyId: string;
  now: string;
  qr: Readonly<{ context: "DETAINEE" | "BLOCK" | "TEMPORARY_EXIT" | "DEPORTATION"; detaineeId: string; issuedAt: string; expiresAt?: string }>;
  expectedQrContext: "RUDENIM_STAY" | "TEMPORARY_EXIT" | "DEPORTATION";
  resourceExists: boolean;
  requestId: string;
  correlationId: string;
  transactionId: string;
  idempotencyKey: string;
  requestHash: string;
  reportDate: string;
  shiftId: string;
  groupId: string;
  actorId: string;
}>;

export type FullSyntheticE2EResult = Readonly<{
  version: typeof FULL_SYNTHETIC_E2E_VERSION;
  journeyId: string;
  correlationId: string;
  qr: QrVerificationResult;
  resourceId: string;
  action: "REGISTER_SCAN";
  mutation: "COMMITTED";
  auditId: string;
  outboxEventId: string;
  dataset: CanonicalDailyDataset;
  reportInput: ReturnType<typeof canonicalDatasetToDailyGuardWebReportInput>;
  syntheticOnly: true;
}>;

type Harness = {
  stores: MutationIntegrationStores;
  idempotency: Map<string, IdempotencyRecord>;
  audits: MutationAuditRecord[];
  outbox: OutboxEventContract[];
  transactionRunner: TransactionRunner;
};

function requireText(...values: readonly string[]): void {
  if (values.some((value) => !value.trim())) throw new Error("FULL_SYNTHETIC_E2E_IDENTITY_REQUIRED");
}

function createHarness(context: ExecutionContext): Harness {
  const idempotency = new Map<string, IdempotencyRecord>();
  const audits: MutationAuditRecord[] = [];
  const outbox: OutboxEventContract[] = [];
  const stores: MutationIntegrationStores = {
    findIdempotency: (key) => idempotency.get(key),
    saveIdempotency: (record) => idempotency.set(record.idempotencyKey, record),
    claimIdempotency: (record) => {
      if (idempotency.has(record.idempotencyKey)) return "EXISTING";
      idempotency.set(record.idempotencyKey, record);
      return "CLAIMED";
    },
    appendAudit: (record) => audits.push(record),
    appendPending: async (event) => {
      if (outbox.some((existing) => existing.eventId === event.eventId)) return "CONFLICT";
      outbox.push(event);
      return "ADMIT";
    },
  };
  const transactionRunner: TransactionRunner = async (transactionContext, work) => {
    if (transactionContext.requestId !== context.requestId ||
        transactionContext.correlationId !== context.correlationId ||
        transactionContext.transactionId !== context.transactionId ||
        transactionContext.idempotencyKey !== context.idempotencyKey) {
      throw new Error("FULL_SYNTHETIC_E2E_CONTEXT_DRIFT");
    }
    return work();
  };
  return { stores, idempotency, audits, outbox, transactionRunner };
}

export async function runFullSyntheticE2E(input: FullSyntheticE2EInput): Promise<FullSyntheticE2EResult> {
  requireText(input.journeyId, input.qr.detaineeId, input.requestId, input.correlationId, input.transactionId, input.idempotencyKey, input.requestHash, input.reportDate, input.shiftId, input.groupId, input.actorId);
  if (input.resourceExists !== true) throw new Error("FULL_SYNTHETIC_E2E_RESOURCE_NOT_FOUND");

  const qr = verifyQrScan({
    payload: input.qr,
    expectedContext: input.expectedQrContext,
    now: input.now,
    activeDetainee: true,
  });
  if (qr.outcome !== "ACCEPTED" || !qr.detaineeId) throw new Error("FULL_SYNTHETIC_E2E_QR_REJECTED");

  const resourceId = qr.detaineeId;
  const context = createExecutionContext({
    requestId: input.requestId,
    correlationId: input.correlationId,
    transactionId: input.transactionId,
    idempotencyKey: input.idempotencyKey,
  });
  const harness = createHarness(context);
  const auditId = "AUDIT-" + input.journeyId;
  const outboxEventId = "OUTBOX-" + input.journeyId;
  const result = await executeCriticalMutation(
    {
      context,
      commandType: "QR_REGISTER_SCAN",
      aggregateId: resourceId,
      requestHash: input.requestHash,
      auditId,
      eventId: outboxEventId,
      occurredAt: input.now,
      payload: {
        journeyId: input.journeyId,
        resourceId,
        action: "REGISTER_SCAN",
        correlationId: input.correlationId,
        source: "SYNTHETIC_QR",
      },
      payloadFingerprint: "PF-" + input.requestHash,
      responseFingerprint: "RF-" + input.journeyId,
      runDomainMutation: async () => ({ resourceId, action: "REGISTER_SCAN" as const }),
    },
    harness.stores,
    harness.transactionRunner,
  );
  if (result.outcome !== "COMMITTED") throw new Error("FULL_SYNTHETIC_E2E_MUTATION_NOT_COMMITTED");

  const evidence = {
    evidenceId: "MFE-" + input.journeyId,
    eventType: "PERGERAKAN" as const,
    capturedAt: input.now,
    actorId: input.actorId,
    location: "SYNTHETIC-RUDENIM",
    rawNote: "QR → Data → Action → Mutation committed for " + resourceId,
    sourceKind: "DATA" as const,
    includeInReport: true,
    photoRefs: [],
    sequence: 1,
    syntheticOnly: true as const,
  };
  const dataset = collectMfeEvidenceToCanonicalDataset({
    datasetId: "DATASET-" + input.journeyId,
    reportDate: input.reportDate,
    shiftId: input.shiftId,
    groupId: input.groupId,
    evidence: [evidence],
  });
  const reportInput = canonicalDatasetToDailyGuardWebReportInput(dataset);

  const audit = harness.audits[0];
  const outbox = harness.outbox[0];
  if (!audit || !outbox) throw new Error("FULL_SYNTHETIC_E2E_DOWNSTREAM_EVIDENCE_MISSING");
  if (audit.executionContext.correlationId !== input.correlationId ||
      outbox.executionContext.correlationId !== input.correlationId ||
      reportInput.sourceRecordIds[0] !== evidence.evidenceId ||
      !JSON.stringify(reportInput).includes(dataset.deterministicHash)) {
    throw new Error("FULL_SYNTHETIC_E2E_EVIDENCE_CHAIN_DRIFT");
  }

  return Object.freeze({
    version: FULL_SYNTHETIC_E2E_VERSION,
    journeyId: input.journeyId,
    correlationId: input.correlationId,
    qr,
    resourceId,
    action: "REGISTER_SCAN",
    mutation: "COMMITTED",
    auditId: audit.auditId,
    outboxEventId: outbox.eventId,
    dataset,
    reportInput,
    syntheticOnly: true,
  });
}

export function assertFullSyntheticE2EReady(result: FullSyntheticE2EResult): void {
  requireText(result.version, result.journeyId, result.correlationId, result.resourceId, result.auditId, result.outboxEventId, result.dataset.datasetId, result.dataset.deterministicHash, result.reportInput.documentId);
  if (result.syntheticOnly !== true || result.qr.outcome !== "ACCEPTED" || result.action !== "REGISTER_SCAN" || result.mutation !== "COMMITTED") {
    throw new Error("FULL_SYNTHETIC_E2E_NOT_READY");
  }
  if (result.reportInput.status !== "GENERATED" || result.reportInput.templateVersion !== "DAILY-GUARD-v1.1") {
    throw new Error("FULL_SYNTHETIC_E2E_REPORT_NOT_READY");
  }
  if (!result.reportInput.sourceRecordIds.includes("MFE-" + result.journeyId)) {
    throw new Error("FULL_SYNTHETIC_E2E_REPORT_EVIDENCE_BINDING_MISSING");
  }
}
