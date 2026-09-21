export const SCHEMA_RECONCILIATION_CONTRACT_VERSION = "P9.14-v1";

export type ReconciliationStatus = "MATCH" | "MISMATCH" | "MISSING" | "UNEXPECTED" | "UNVERIFIED";

export interface ExpectedObject {
  schema: string;
  name: string;
  kind: "TABLE" | "INDEX" | "FUNCTION" | "POLICY" | "BUCKET";
  contractVersion: string;
}

export interface ActualObject {
  schema: string;
  name: string;
  kind: ExpectedObject["kind"];
  fingerprint: string;
}

export interface ReconciliationItem {
  expected: ExpectedObject;
  actual?: ActualObject;
  status: ReconciliationStatus;
  notes?: string;
}

export function reconcileSchema(
  expected: ExpectedObject[],
  actual: ActualObject[],
): ReconciliationItem[] {
  return expected.map((item) => {
    const found = actual.find((x) =>
      x.schema === item.schema && x.name === item.name && x.kind === item.kind
    );
    if (!found) return { expected:item, status:"MISSING" };
    return { expected:item, actual:found, status:"UNVERIFIED", notes:"Fingerprint comparison requires approved contract material." };
  });
}

export function migrationGate(items: ReconciliationItem[]): "BLOCKED" | "ELIGIBLE_FOR_REVIEW" {
  if (items.some((item) => item.status === "MISSING" || item.status === "MISMATCH" || item.status === "UNEXPECTED"))
    return "BLOCKED";
  if (items.some((item) => item.status === "UNVERIFIED"))
    return "BLOCKED";
  return "ELIGIBLE_FOR_REVIEW";
}
