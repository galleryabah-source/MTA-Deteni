import fs from "node:fs/promises";
import path from "node:path";
import { buildReconciliationRows, deriveEffectivePolicies, summarize, uniqueLower } from "./p9.6-reconciliation-engine.mjs";

const root = process.cwd();
const actual = JSON.parse(await fs.readFile(path.join(root, "artifacts/p9.6/local-postgres-introspection.json"), "utf8"));
const migrationDir = path.join(root, "supabase/migrations");
const files = (await fs.readdir(migrationDir)).filter((file) => file.endsWith(".sql")).sort();
const sql = (await Promise.all(files.map((file) => fs.readFile(path.join(migrationDir, file), "utf8")))).join("\n");

const expectedTables = uniqueLower(
  [...sql.matchAll(/create\s+table\s+if\s+not\s+exists\s+public\.([a-z0-9_]+)/gi)].map((match) => "public." + match[1]),
);
const expectedIndexes = uniqueLower(
  [...sql.matchAll(/create\s+index\s+if\s+not\s+exists\s+([a-z0-9_]+)/gi)].map((match) => match[1]),
);
const expectedFunctions = uniqueLower(
  [...sql.matchAll(/create\s+(?:or\s+replace\s+)?function\s+(?:public|private)\.([a-z0-9_]+)/gi)].map((match) => match[1]),
);
const expectedTriggers = uniqueLower(
  [...sql.matchAll(/create\s+trigger\s+([a-z0-9_]+)/gi)].map((match) => match[1]),
);
const expectedPolicies = deriveEffectivePolicies(sql);

const actualTables = uniqueLower(
  (actual.tables ?? []).filter((row) => row.schema_name === "public").map((row) => "public." + row.table_name),
);
const actualIndexes = uniqueLower(
  (actual.indexes ?? []).filter((row) => row.schema_name === "public").map((row) => row.index_name),
);
const actualFunctions = uniqueLower(
  (actual.functions ?? []).filter((row) => ["public", "private"].includes(row.schema_name)).map((row) => row.function_name),
);
const actualTriggers = uniqueLower((actual.triggers ?? []).map((row) => row.trigger_name));
const actualPolicies = uniqueLower((actual.policies ?? []).map((row) => row.policyname));

const constraintBackedIndexes = uniqueLower(
  (actual.constraints ?? [])
    .filter((row) => row.schema_name === "public" && ["p", "u"].includes(row.constraint_type))
    .map((row) => row.constraint_name),
);

const all = [
  ...buildReconciliationRows(expectedTables, actualTables, "table"),
  ...buildReconciliationRows(expectedIndexes, actualIndexes, "index", {
    justifiedActual: constraintBackedIndexes,
    justification: "postgresql-auto-index-for-primary-key-or-unique-constraint",
  }),
  ...buildReconciliationRows(expectedFunctions, actualFunctions, "function"),
  ...buildReconciliationRows(expectedTriggers, actualTriggers, "trigger"),
  ...buildReconciliationRows(expectedPolicies, actualPolicies, "policy"),
];

const summary = summarize(all);
const out = path.join(root, "artifacts/p9.6/schema-reconciliation-matrix.json");
await fs.mkdir(path.dirname(out), { recursive: true });
await fs.writeFile(
  out,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      basis: "repository migration effective-state evidence vs disposable local PostgreSQL introspection",
      migrationFiles: files,
      replayBaselineNote: "mta_current_role is provisioned only in the disposable compatibility layer because the earlier private-helper migration assumes an existing baseline function.",
      reconciliationEngineVersion: "P9.6-R1",
      policyModel: "effective-final-state-after-sequential-drop-create-lifecycle",
      indexModel: "constraint-backed PostgreSQL indexes are justified by primary-key/unique constraints",
      unsupportedSemanticStatuses: {
        CONFLICT: "not inferable from object-name-only evidence; requires definition-level reconciliation",
        UNSAFE: "requires security/integrity rule evaluation beyond object-name-only evidence",
        UNKNOWN: "used only when required evidence is unavailable; current name-level comparisons do not manufacture UNKNOWN findings",
      },
      summary,
      rows: all,
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify(summary, null, 2));
