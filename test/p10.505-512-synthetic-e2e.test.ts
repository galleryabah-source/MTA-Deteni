import { test } from "node:test";
import assert from "node:assert/strict";
import { TemporaryExitService } from "../src/domain/temporary-exit/service.js";
import { TemporaryExitWorkflow } from "../src/application/temporary-exit-workflow.js";
import { actor, fixedNow } from "./service-test-support.js";

test("synthetic temporary-exit happy path cannot bypass governance gates", async () => {
  const exits = new Map<string, any>();
  const exitService = new TemporaryExitService({ repository: { get: async (id) => exits.get(id) ?? null, save: async (e) => exits.set(e.id, e) }, now: fixedNow, canManage: () => true });
  await exitService.request({ id: "SYN-EXIT-0001", detaineeId: "SYN-DET-0001", plannedDepartureAt: "2026-09-15T10:00:00Z", plannedReturnAt: "2026-09-15T12:00:00Z", actor: actor("kamtib-1", "KAMTIB") });

  let approved = false;
  let documented = false;
  let escorted = false;
  const audit: string[] = [];
  const workflow = new TemporaryExitWorkflow(
    exitService,
    {
      currentState: async (id) => exits.get(id)?.state ?? null,
      approvalState: async () => approved ? "APPROVED" : "PENDING",
      documentState: async () => documented ? "VALID" : "MISSING",
      escortState: async () => escorted ? "ASSIGNED" : "MISSING",
    },
    { authorize: async () => true },
    { append: async (e) => audit.push(e.eventType), enqueue: async () => undefined },
    { run: async (work) => work() },
  );

  await workflow.advance({ exitId: "SYN-EXIT-0001", from: "REQUESTED", to: "VALIDATED", actor: actor("kamtib-1", "KAMTIB") });
  approved = true;
  await workflow.advance({ exitId: "SYN-EXIT-0001", from: "VALIDATED", to: "APPROVED", actor: actor("head-1", "HEAD_RUDENIM") });
  documented = true;
  await workflow.advance({ exitId: "SYN-EXIT-0001", from: "APPROVED", to: "DOCUMENTED", actor: actor("tu-1", "SUBBAG_TU") });
  escorted = true;
  await workflow.advance({ exitId: "SYN-EXIT-0001", from: "DOCUMENTED", to: "ESCORT_ASSIGNED", actor: actor("kamtib-1", "KAMTIB") });
  await workflow.advance({ exitId: "SYN-EXIT-0001", from: "ESCORT_ASSIGNED", to: "DEPARTED", actor: actor("kamtib-1", "KAMTIB") });
  await workflow.advance({ exitId: "SYN-EXIT-0001", from: "DEPARTED", to: "RETURN_PENDING", actor: actor("kamtib-1", "KAMTIB") });
  await workflow.advance({ exitId: "SYN-EXIT-0001", from: "RETURN_PENDING", to: "RETURNED", actor: actor("kamtib-1", "KAMTIB") });
  await workflow.advance({ exitId: "SYN-EXIT-0001", from: "RETURNED", to: "COMPLETED", actor: actor("kamtib-1", "KAMTIB") });

  assert.equal(exits.get("SYN-EXIT-0001").state, "COMPLETED");
  assert.equal(audit.length, 8);
});
