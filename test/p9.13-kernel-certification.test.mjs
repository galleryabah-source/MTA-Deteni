import assert from "node:assert/strict";
import test from "node:test";

const REQUIRED = [
  "P9.2","P9.3","P9.4","P9.5","P9.6",
  "P9.7","P9.8","P9.9","P9.10","P9.11","P9.12"
];

function certify(evidence) {
  const complete = REQUIRED.every((id) => evidence[id] === "PASS" || evidence[id] === "ACCEPTED");
  return complete ? "CERTIFIED" : "NOT_CERTIFIED";
}

test("P9.13 requires every kernel contract evidence item", () => {
  const evidence = Object.fromEntries(REQUIRED.map((id) => [id, "ACCEPTED"]));
  assert.equal(certify(evidence), "CERTIFIED");
});

test("P9.13 denies certification when evidence is missing", () => {
  const evidence = Object.fromEntries(REQUIRED.slice(0, -1).map((id) => [id, "ACCEPTED"]));
  assert.equal(certify(evidence), "NOT_CERTIFIED");
});

test("P9.13 denies certification when one required gate fails", () => {
  const evidence = Object.fromEntries(REQUIRED.map((id) => [id, "ACCEPTED"]));
  evidence.P9.5 = "FAIL";
  assert.equal(certify(evidence), "NOT_CERTIFIED");
});
