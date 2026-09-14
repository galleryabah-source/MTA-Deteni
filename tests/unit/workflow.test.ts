import { describe, expect, it } from "vitest";
import { StateMachine } from "../../src/lib/workflow/state-machine";

type State = "DRAFT" | "APPROVED" | "ISSUED";

describe("StateMachine", () => {
  const machine = new StateMachine<State>([
    { from: "DRAFT", to: "APPROVED", requiredPermission: "approve.document", requiresDifferentActorFrom: "u1" },
    { from: "APPROVED", to: "ISSUED", requiredPermission: "issue.document" },
  ], (permission, actor) => actor.roles.includes("APPROVER") && permission === "approve.document");

  it("rejects undefined transitions", () => {
    const result = machine.transition({ currentState: "DRAFT", targetState: "ISSUED", actor: { userId: "u2", roles: ["APPROVER"] }, idempotencyKey: "i1" });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("TRANSITION_NOT_DEFINED");
  });

  it("enforces separation of duties", () => {
    const result = machine.transition({ currentState: "DRAFT", targetState: "APPROVED", actor: { userId: "u1", roles: ["APPROVER"] }, idempotencyKey: "i2" });
    expect(result.reason).toBe("SEPARATION_OF_DUTIES_REQUIRED");
  });

  it("allows a valid guarded transition", () => {
    const result = machine.transition({ currentState: "DRAFT", targetState: "APPROVED", actor: { userId: "u2", roles: ["APPROVER"] }, idempotencyKey: "i3" });
    expect(result.allowed).toBe(true);
  });
});
