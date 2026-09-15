export type ReportSourceBinding = Readonly<{
  elementKey: string;
  sourceField: string;
  expectedValue: string;
  actualValue: string;
}>;

export function assertReportSourceReconciliation(bindings: readonly ReportSourceBinding[]): void {
  if (bindings.length === 0) throw new Error("REPORT_SOURCE_BINDINGS_REQUIRED");
  for (const binding of bindings) {
    if (!binding.elementKey.trim() || !binding.sourceField.trim()) throw new Error("REPORT_SOURCE_BINDING_IDENTITY_REQUIRED");
    if (binding.expectedValue !== binding.actualValue) throw new Error(`REPORT_SOURCE_RECONCILIATION_FAILED:${binding.elementKey}`);
  }
}
