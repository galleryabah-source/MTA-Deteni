import { describe, expect, it } from "vitest";
import { InMemoryAtomicNumberingRepository } from "../../src/lib/document-engine/atomic-numbering";

describe("atomic document numbering", () => {
  it("allocates unique sequential numbers per prefix and year", async () => {
    const repo = new InMemoryAtomicNumberingRepository();
    const first = await repo.reserveNext({ prefix: "SIP", year: 2026 });
    const second = await repo.reserveNext({ prefix: "SIP", year: 2026 });
    expect(first.number).toBe("SIP/0001/2026");
    expect(second.number).toBe("SIP/0002/2026");
    expect(first.registerKey).not.toBe(second.registerKey);
  });

  it("keeps numbering sequences independent by prefix and year", async () => {
    const repo = new InMemoryAtomicNumberingRepository();
    expect((await repo.reserveNext({ prefix: "SIP", year: 2026 })).number).toBe("SIP/0001/2026");
    expect((await repo.reserveNext({ prefix: "STP", year: 2026 })).number).toBe("STP/0001/2026");
    expect((await repo.reserveNext({ prefix: "SIP", year: 2027 })).number).toBe("SIP/0001/2027");
  });

  it("rejects duplicate durable commit for the same register key", async () => {
    const repo = new InMemoryAtomicNumberingRepository();
    const reservation = await repo.reserveNext({ prefix: "SIP", year: 2026 });
    await repo.commit(reservation, "DOC-SYN-001", "2026-09-14T08:00:00Z");
    await expect(repo.commit(reservation, "DOC-SYN-002", "2026-09-14T08:01:00Z"))
      .rejects.toThrow("DOCUMENT_NUMBER_ALREADY_COMMITTED");
  });
});
