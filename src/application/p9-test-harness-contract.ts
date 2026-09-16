export type HarnessControl = Readonly<{ id: string; command: string; required: true }>;
export type HarnessResult = Readonly<{ controlId: string; status: "PASS" | "FAIL"; exitCode: number | null }>;

export function validateHarnessResults(controls: readonly HarnessControl[], results: readonly HarnessResult[]): void {
  const requiredIds = new Set(controls.map((control) => control.id));
  for (const control of controls) if (!control.id.trim() || !control.command.trim() || control.required !== true) throw new Error("HARNESS_CONTROL_INVALID");
  for (const controlId of requiredIds) {
    const result = results.find((item) => item.controlId === controlId);
    if (!result || result.status !== "PASS" || result.exitCode !== 0) throw new Error(`HARNESS_CONTROL_FAILED:${controlId}`);
  }
}
