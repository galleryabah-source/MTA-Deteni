import assert from "node:assert/strict";
import test from "node:test";
import type { ActorContext } from "../src/domain/shared/contracts.js";
import { runAuthorizationAdversarialSuite } from "../src/application/authorization-adversarial-certification.js";

const base: ActorContext = { actorId:"ACT-SYN-SEC", role:"OPERATOR", domain:"KAMTIB", scope:{}, correlationId:"CORR-SYN-SEC", idempotencyKey:"IDEMP-SYN-SEC" };

test("security adversarial: cross-domain privilege escalation is denied", () => {
  const results = runAuthorizationAdversarialSuite([
    { name:"KAMTIB→PERKES", actor:base, permission:"HEALTH_RECORD_MANAGE", expected:false },
    { name:"KAMTIB→RAP", actor:base, permission:"DETAINEE_ADMINISTER", expected:false },
    { name:"KAMTIB operational permission", actor:base, permission:"TEMPORARY_EXIT_VALIDATE", expected:true },
  ]);
  assert.ok(results.every(x => x.status === "PASS"));
});

test("security adversarial: forged identity/correlation is denied", () => {
  const results = runAuthorizationAdversarialSuite([
    { name:"blank actor", actor:{...base, actorId:""}, permission:"TEMPORARY_EXIT_VALIDATE", expected:false },
    { name:"blank correlation", actor:{...base, correlationId:""}, permission:"TEMPORARY_EXIT_VALIDATE", expected:false },
  ]);
  assert.ok(results.every(x => x.status === "PASS"));
});

test("security adversarial: leadership cannot inherit operational mutation permissions", () => {
  const leadership = {...base, domain:"HEAD_RUDENIM"} as ActorContext;
  const results = runAuthorizationAdversarialSuite([
    { name:"leadership read", actor:leadership, permission:"OVERSIGHT_READ", expected:true },
    { name:"leadership operational mutation", actor:leadership, permission:"TEMPORARY_EXIT_VALIDATE", expected:false },
    { name:"unknown permission", actor:leadership, permission:"ROOT_ADMIN", expected:false },
  ]);
  assert.ok(results.every(x => x.status === "PASS"));
});

test("security adversarial: empty suite is deterministically safe", () => {
  assert.deepEqual(runAuthorizationAdversarialSuite([]), []);
});
