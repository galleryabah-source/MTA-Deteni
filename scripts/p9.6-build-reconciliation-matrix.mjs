import fs from "node:fs/promises";
import path from "node:path";
import { P96_CONTRACT } from "../p9.6/database-contract.mjs";
import { buildReconciliationRows, deriveEffectivePolicies, summarize, uniqueLower } from "./p9.6-reconciliation-engine.mjs";

const root = process.cwd();
const actual = JSON.parse(await fs.readFile(path.join(root, "artifacts/p9.6/local-postgres-introspection.json"), "utf8"));
const migrationDir = path.join(root, "supabase/migrations");
const files = (await fs.readdir(migrationDir)).filter((file) => file.endsWith(".sql")).sort();
const sql = (await Promise.all(files.map((file) => fs.readFile(path.join(migrationDir, file), "utf8")))).join("\n");

const expectedTables = uniqueLower([
  ...sql.matchAll(/create\s+table\s+if\s+not\s+exists\s+public\.([a-z0-9_]+)/gi),
].map((match) => "public." + match[1]));
const expectedIndexes = uniqueLower([
  ...sql.matchAll(/create\s+(?:unique\s+)?index\s+(?:if\s+not\s+exists\s+)?([a-z0-9_]+)/gi),
].map((match) => match[1]));
const expectedFunctions = uniqueLower([
  ...sql.matchAll(/create\s+(?:or\s+replace\s+)?function\s+(?:public|private)\.([a-z0-9_]+)/gi),
].map((match) => match[1]));
const expectedTriggers = uniqueLower([
  ...sql.matchAll(/create\s+trigger\s+([a-z0-9_]+)/gi),
].map((match) => match[1]));
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

const expectedContractColumns = uniqueLower(
  Object.entries(P96_CONTRACT.columns).flatMap(([table, columns]) => columns.map((column) => table + "." + column)),
);
const actualContractColumns = uniqueLower(
  (actual.columns ?? [])
    .filter((row) => P96_CONTRACT.tables.includes(row.table_schema + "." + row.table_name))
    .map((row) => row.table_schema + "." + row.table_name + "." + row.column_name),
);

const normalizeConstraintDefinition = (definition) => definition
  .replace(/\bpublic\./gi, "")
  .replace(/\s+/g, " ")
  .trim()
  .toLowerCase();

const expectedForeignKeys = Object.keys(P96_CONTRACT.foreignKeys);
const actualForeignKeys = (actual.constraints ?? [])
  .filter((row) => row.constraint_type === "f")
  .reduce((map, row) => {
    map.set(row.constraint_name.toLowerCase(), row.definition);
    return map;
  }, new Map());

const all = [
  ...buildReconciliationRows(expectedTables, actualTables, "table"),
  ...buildReconciliationRows(expectedIndexes, actualIndexes, "index", {
    justifiedActual: uniqueLower(
      (actual.constraints ?? [])
        .filter((row) => row.schema_name === "public" && ["p", "u"].includes(row.constraint_type))
        .map((row) => row.constraint_name),
    ),
    justification: "postgresql-auto-index-for-primary-key-or-unique-constraint",
  }),
  ...buildReconciliationRows(expectedFunctions, actualFunctions, "function"),
  ...buildReconciliationRows(expectedTriggers, actualTriggers, "trigger"),
  ...buildReconciliationRows(expectedPolicies, actualPolicies, "policy"),
  ...buildReconciliationRows(expectedContractColumns, actualContractColumns, "column"),
];

for (const [constraintName, expectedDefinition] of Object.entries(P96_CONTRACT.foreignKeys)) {
  const actualDefinition = actualForeignKeys.get(constraintName.toLowerCase());
  all.push({
    object_type: "foreign_key",
    object: constraintName.toLowerCase(),
    expected: true,
    actual: actualDefinition !== undefined,
    status: actualDefinition === undefined
      ? "MISSING"
      : normalizeConstraintDefinition(actualDefinition) === normalizeConstraintDefinition(expectedDefinition)
        ? "MATCH"
        : "CONFLICT",
    expected_definition: expectedDefinition,
    actual_definition: actualDefinition ?? null,
  });
}

const summary = summarize(all);
const out = path.join(root, "artifacts/p9.6/schema-reconciliation-matrix.json");
await fs.mkdir(path.dirname(out), { recursive: true });
await fs.writeFile(
  out,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      basis: "repository migration effective-state evidence + explicit P9.6 contract manifest vs disposable local PostgreSQL introspection",
      migrationFiles: files,
      reconciliationEngineVersion: "P9.6-R2",
      contractManifest: "p9.6/database-contract.mjs",
      policyModel: "effective-final-state-after-sequential-drop-create-lifecycle",
      indexModel: "constraint-backed PostgreSQL indexes are justified by primary-key/unique constraints",
      unsupportedSemanticStatuses: {
        CONFLICT: "used when a required foreign-key definition exists but differs from the canonical contract.",
        UNSAFE: "requires security/integrity rule evaluation beyond this structural matrix.",
        UNKNOWN: "used only when required evidence is unavailable.",
      },
      summary,
      rows: all,
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify(summary, null, 2));
