import test from "node:test";
import assert from "node:assert/strict";
import { createMemoryRepository, createMemoryRepositoryRegistry, type RepositoryEntity } from "../src/application/repository-contract.js";

const entity = (id: string, version: number): RepositoryEntity => ({ id, version });

test("P13.7201-7240 memory repository preserves identity and monotonic version", () => {
  const repository = createMemoryRepository<RepositoryEntity>();
  repository.save(entity("detainee-1", 1));
  repository.save(entity("detainee-1", 2));
  assert.equal(repository.get("detainee-1")?.entity.version, 2);
  assert.throws(() => repository.save(entity("detainee-1", 1)), /version regression/i);
});

test("P13.7241-7280 registry exposes explicit aggregate boundaries", () => {
  const registry = createMemoryRepositoryRegistry();
  for (const name of ["DETAINEE", "PLACEMENT", "MOVEMENT", "TEMPORARY_EXIT", "REPORT", "AUDIT"] as const) {
    assert.ok(registry[name]);
    registry[name].save(entity(`${name.toLowerCase()}-1`, 0));
    assert.equal(registry[name].list().length, 1);
  }
});

test("P13.7281-7320 repository rejects invalid identity and supports deterministic removal", () => {
  const repository = createMemoryRepository<RepositoryEntity>();
  assert.throws(() => repository.save(entity("", 0)), /identity/i);
  repository.save(entity("report-1", 0));
  repository.remove("report-1");
  assert.equal(repository.get("report-1"), undefined);
});
