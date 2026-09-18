import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const evidenceDir = path.join(root, "artifacts", "p1-runtime-evidence");
fs.mkdirSync(evidenceDir, { recursive: true });

const controls = [
  ["P1-CTX-01", ["test/critical-mutation-context-contract.test.ts", "test/critical-mutation-e2e-context-harness.test.ts"]],
  ["P1-IDEM-02", ["test/transaction-idempotency-boundary.test.ts", "test/p1-runtime-failure-matrix.test.ts"]],
  ["P1-TX-03", ["test/critical-mutation-failure-path.test.ts", "test/p1-runtime-failure-matrix.test.ts"]],
  ["P1-AUDIT-04", ["test/critical-mutation-failure-path.test.ts", "test/critical-mutation-e2e-context-harness.test.ts"]],
  ["P1-OUTBOX-05", ["test/outbox-runtime-contract.test.ts", "test/p1-runtime-failure-matrix.test.ts"]],
  ["P1-OBS-06", ["test/observability-context-continuity.test.ts", "test/critical-mutation-e2e-context-harness.test.ts"]],
  ["P1-FAIL-07", ["test/p1-runtime-failure-matrix.test.ts", "test/critical-mutation-failure-path.test.ts"]],
];

const results = [];
for (const [controlId, testFiles] of controls) {
  const missing = testFiles.filter((file) => !fs.existsSync(path.join(root, file)));
  if (missing.length) {
    results.push({ controlId, status: "FAIL", exitCode: 2, evidenceRef: missing.join(",") });
    continue;
  }
  const child = spawnSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "--test", ...testFiles], {
    cwd: root,
    encoding: "utf8",
  });
  const output = `${child.stdout ?? ""}${child.stderr ?? ""}`;
  const evidenceFile = path.join(evidenceDir, `${controlId}.log`);
  fs.writeFileSync(evidenceFile, output);
  results.push({
    controlId,
    status: child.status === 0 ? "PASS" : "FAIL",
    exitCode: Number.isInteger(child.status) ? child.status : 1,
    evidenceRef: path.relative(root, evidenceFile),
  });
}

const evidence = {
  schemaVersion: "mta-p1-runtime-certification/v1",
  executionId: process.env.GITHUB_RUN_ID ? `github-${process.env.GITHUB_RUN_ID}` : `local-${Date.now()}`,
  commit: process.env.GITHUB_SHA || "unknown",
  environment: "controlled-nonprod",
  productionAccessAuthorized: false,
  migrationExecuted: false,
  aiEnabled: false,
  status: results.every((item) => item.status === "PASS") ? "OBSERVED_PASS" : "OBSERVATION_INCOMPLETE",
  controls: results,
};

fs.writeFileSync(
  path.join(evidenceDir, "p1-runtime-certification.json"),
  JSON.stringify(evidence, null, 2),
);

console.log(JSON.stringify(evidence, null, 2));
process.exitCode = evidence.status === "OBSERVED_PASS" ? 0 : 1;
