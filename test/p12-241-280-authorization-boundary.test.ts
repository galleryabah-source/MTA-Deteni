import assert from "node:assert/strict";
import test from "node:test";
import type { ActorContext } from "../src/domain/shared/contracts.js";
import { PolicyEnforcingAuthorization, assertAuthorizationBoundary } from "../src/application/p12-241-280-policy-enforcing-authorization.js";

const actor: ActorContext = { actorId: "ACT-SYN-AUTH", role: "OPERATOR", domain: "KAMTIB", scope: {}, correlationId: "CORR-SYN-AUTH", idempotencyKey: "IDEMP-SYN-AUTH" };

test("P12.241-280 allows only permissions declared for actor domain", async () => {
  const decisions: string[] = [];
  const authorization = new PolicyEnforcingAuthorization({ record: async (decision) => { decisions.push(`${decision.permission}:${decision.allowed}`); } });
  assert.equal(await authorization.authorize(actor, "TEMPORARY_EXIT_VALIDATE"), true);
  assert.equal(await authorization.authorize(actor, "HEALTH_RECORD_MANAGE"), false);
  assert.deepEqual(decisions, ["TEMPORARY_EXIT_VALIDATE:true", "HEALTH_RECORD_MANAGE:false"]);
});

test("P12.241-280 denies missing actor identity", async () => {
  assert.equal(await new PolicyEnforcingAuthorization().authorize({ ...actor, actorId: "" }, "TEMPORARY_EXIT_VALIDATE"), false);
  assert.throws(() => assertAuthorizationBoundary({ ...actor, actorId: "" }, "TEMPORARY_EXIT_VALIDATE"), /ACTOR_CONTEXT_REQUIRED/);
});

test("P12.241-280 keeps legacy leadership vocabulary out of direct operational mutation permissions", async () => {
  const leadership = { ...actor, domain: "LEADERSHIP" } as unknown as ActorContext;
  const authorization = new PolicyEnforcingAuthorization();
  assert.equal(await authorization.authorize(leadership, "OVERSIGHT_READ"), false);
  assert.equal(await authorization.authorize(leadership, "TEMPORARY_EXIT_VALIDATE"), false);
});
