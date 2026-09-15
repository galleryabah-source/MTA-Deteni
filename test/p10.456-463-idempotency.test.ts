import { test } from "node:test";
import assert from "node:assert/strict";
import { acquireMutation, completeMutation } from "../src/application/mutation-guard.js";
import type { IdempotencyPort } from "../src/application/ports.js";
import { actor } from "./service-test-support.js";

class MemoryIdempotency implements IdempotencyPort<string> {
  readonly entries = new Map<string, { fingerprint: string; result?: string }>();
  async replay(key: string): Promise<string | null> { return this.entries.get(key)?.result ?? null; }
  async begin(key: string, fingerprint: string): Promise<"ACQUIRED" | "REPLAY" | "CONFLICT"> {
    const existing = this.entries.get(key);
    if (!existing) { this.entries.set(key, { fingerprint }); return "ACQUIRED"; }
    return existing.fingerprint === fingerprint ? "REPLAY" : "CONFLICT";
  }
  async complete(key: string, result: string): Promise<void> {
    const entry = this.entries.get(key);
    if (!entry) throw new Error("missing reservation");
    entry.result = result;
  }
}

test("idempotency replays identical mutation and rejects key reuse with another fingerprint", async () => {
  const store = new MemoryIdempotency();
  const guard = { correlationId: "COR-1", idempotencyKey: "IDEMP-1", actor: actor("k-1", "KAMTIB") };
  assert.equal(await acquireMutation(guard, "fp-A", store), null);
  await completeMutation(guard, "RESULT-A", store);
  assert.equal(await acquireMutation(guard, "fp-A", store), "RESULT-A");
  await assert.rejects(() => acquireMutation(guard, "fp-B", store));
});
