import { test } from "node:test";
import assert from "node:assert/strict";
import { TemporaryExitService } from "../src/domain/temporary-exit/service.js";
import { TemporaryExitWorkflow } from "../src/application/temporary-exit-workflow.js";
import { bindApprovedNumbering } from "../src/domain/document-engine/contracts.js";
import { actor, fixedNow } from "./service-test-support.js";

test("temporary-exit workflow fails closed before approval/document/escort prerequisites", async () => {
  const exits = new Map<string, any>();
  const exitService = new TemporaryExitService({ repository: { get: async (id) => exits.get(id) ?? null, save: async (e) => { exits.set(e.id, e); } }, now: fixedNow, canManage: () => true });
  await exitService.request({ id: "EXIT-1", detaineeId: "SYN-D1", plannedDepartureAt: "2026-09-15T10:00:00Z", plannedReturnAt: "2026-09-15T12:00:00Z", actor: actor("k-1", "KAMTIB") });
  const audit: string[] = [];
  const workflow = new TemporaryExitWorkflow(
    exitService,
    {
      currentState: async (id) => exits.get(id)?.state ?? null,
      approvalState: async () => "PENDING",
      documentState: async () => "MISSING",
      escortState: async () => "MISSING",
    },
    { authorize: async () => true },
    { append: async (e) => audit.push(e.eventType), enqueue: async () => undefined },
    { run: async (work) => work() },
  );
  await assert.rejects(() => workflow.advance({ exitId: "EXIT-1", from: "REQUESTED", to: "APPROVED", actor: actor("k-1", "KAMTIB") }));
  assert.deepEqual(audit, []);
  assert.equal(exits.get("EXIT-1").state, "REQUESTED");
});

test("temporary-exit workflow rejects stale caller state", async () => {
  const exits = new Map<string, any>();
  const exitService = new TemporaryExitService({ repository: { get: async (id) => exits.get(id) ?? null, save: async (e) => { exits.set(e.id, e); } }, now: fixedNow, canManage: () => true });
  await exitService.request({ id: "EXIT-2", detaineeId: "SYN-D1", plannedDepartureAt: "2026-09-15T10:00:00Z", plannedReturnAt: "2026-09-15T12:00:00Z", actor: actor("k-1", "KAMTIB") });
  const workflow = new TemporaryExitWorkflow(exitService, { currentState: async () => "VALIDATED", approvalState: async () => "APPROVED", documentState: async () => "VALID", escortState: async () => "ASSIGNED" }, { authorize: async () => true }, { append: async () => undefined, enqueue: async () => undefined }, { run: async (work) => work() });
  await assert.rejects(() => workflow.advance({ exitId: "EXIT-2", from: "REQUESTED", to: "VALIDATED", actor: actor("k-1", "KAMTIB") }));
});

test("document binding requires effective template, required fields, approval and server-side issuance permission", async () => {
  const template = { id: "TPL-EXIT", version: "1.0", effectiveFrom: "2026-01-01", requiredFields: ["detaineeName", "purpose"], sha256: "SYN-HASH" };
  const base = {
    actor: actor("tu-1", "SUBBAG_TU"), documentType: "TEMPORARY_EXIT_LETTER", subjectType: "TEMPORARY_EXIT", subjectId: "EXIT-1", templateId: "TPL-EXIT", at: fixedNow(), fields: { detaineeName: "Synthetic Detainee", purpose: "Synthetic test" },
    templates: { getEffective: async () => template }, approvals: { isApproved: async () => true }, numbering: { reserve: async () => "REG-2026-0001" }, canIssue: () => true,
  };
  const result = await bindApprovedNumbering(base);
  assert.equal(result.template.version, "1.0");
  assert.equal(result.numberingRef, "REG-2026-0001");
  await assert.rejects(() => bindApprovedNumbering({ ...base, approvals: { isApproved: async () => false } }));
  await assert.rejects(() => bindApprovedNumbering({ ...base, fields: { detaineeName: "" } }));
});
