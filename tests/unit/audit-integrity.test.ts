import { describe, expect, it } from "vitest";
import { appendAuditEvent, verifyAuditChain } from "../../src/lib/audit/integrity";
import type { AuditEventInput } from "../../src/lib/audit/types";

const input = (id: string): AuditEventInput => ({
  eventId: id,
  eventType: "TEST_EVENT",
  actorUserId: "u1",
  action: "VIEW",
  domain: "DETENI",
  correlationId: "c1",
  occurredAt: "2026-09-14T00:00:00.000Z",
  result: "SUCCESS",
});

describe("audit integrity", () => {
  it("creates and verifies a hash chain", () => {
    const first = appendAuditEvent(input("e1"), undefined);
    const second = appendAuditEvent(input("e2"), first);
    expect(verifyAuditChain([first, second])).toEqual({ valid: true, checked: 2 });
  });

  it("detects tampering", () => {
    const first = appendAuditEvent(input("e1"), undefined);
    const second = appendAuditEvent(input("e2"), first);
    const tampered = { ...second, action: "EDIT" };
    expect(verifyAuditChain([first, tampered]).valid).toBe(false);
  });
});
