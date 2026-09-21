import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const checks = [];

function read(rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    failures.push(`${rel}: missing`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

function check(id, ok, detail) {
  checks.push({ id, status: ok ? "PASS" : "FAIL", detail });
  if (!ok) failures.push(`${id}: ${detail}`);
}

const pkg = JSON.parse(read("package.json") || "{}");
const workflow = read(".github/workflows/mta-domain-ci.yml");
const status = read("PROJECT_STATUS.md");
const exitCriteria = read("P13_EXIT_CRITERIA.md");

check("ARCH-5809", pkg.scripts?.typecheck === "tsc --noEmit", "production typecheck script is explicit");
check("ARCH-5810", pkg.scripts?.["typecheck:test"] === "tsc -p tsconfig.test.json --noEmit", "test typecheck boundary is explicit");
check("ARCH-5811", pkg.scripts?.test === "node --test test/**/*.test.mjs", "JavaScript regression command is deterministic");
check("ARCH-5812", pkg.scripts?.["test:unit"] === "tsx --test test/**/*.test.ts", "TypeScript domain test command is deterministic");
check("ARCH-5813", workflow.includes("MTA_EXECUTION_ENV: controlled-nonprod"), "CI execution environment is controlled-nonprod");
check(
  "ARCH-5814",
  workflow.includes("uses: actions/upload-artifact@v4") &&
    workflow.includes("name: mta-controlled-execution-evidence-") &&
    workflow.includes("path: artifacts/mta-evidence/") &&
    workflow.includes("if: always()"),
  "CI uploads controlled execution evidence from the canonical evidence directory with an always-run upload boundary",
);
check("GOV-5815", status.includes("Migration Freeze: **TRUE**"), "migration freeze remains locked");
check("GOV-5816", status.includes("AI: **OFF**"), "AI remains disabled");
check("GOV-5817", status.includes("SYNTHETIC ONLY"), "repository remains synthetic-only");
check("GOV-5818", status.includes("Production access: **NOT AUTHORIZED**"), "production access remains unauthorized");
check("GOV-5819", !workflow.includes("DATABASE_URL") && !workflow.includes("SUPABASE_URL"), "CI workflow does not require live database credentials");
check("STATE-5820", status.includes("P13.260881–274880"), "status reflects the current terminal governed P13 range");
check("STATE-5821", status.includes("P13.260881–274880 — CLOSED / CONTROLLED-NONPROD EVIDENCE OBSERVED") && !status.includes("OBSERVATION PENDING"), "status reflects observed controlled-nonprod execution evidence without falsely claiming production authorization");
check("GOV-5822", exitCriteria.includes("P13-EXIT-01") && exitCriteria.includes("P13-EXIT-08"), "P13 exit criteria are explicitly versioned");

const evidenceDir = path.join(root, "artifacts", "mta-evidence");
fs.mkdirSync(evidenceDir, { recursive: true });
const evidence = {
  schemaVersion: "mta-contract-evidence/v2",
  controlFamily: "P13-EXIT-GATE",
  executionId: process.env.GITHUB_RUN_ID ? `github-${process.env.GITHUB_RUN_ID}` : `local-${Date.now()}`,
  commit: process.env.GITHUB_SHA || "unknown",
  environment: process.env.MTA_EXECUTION_ENV || "local-controlled-nonprod",
  generatedAt: new Date().toISOString(),
  status: failures.length === 0 ? "PASS" : "FAIL",
  checks,
  failures,
};
fs.writeFileSync(path.join(evidenceDir, "contract-gate.json"), JSON.stringify(evidence, null, 2));

console.log(JSON.stringify(evidence, null, 2));
process.exitCode = failures.length === 0 ? 0 : 1;
