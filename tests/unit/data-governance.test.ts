import { describe, expect, it } from "vitest";
import { classificationAllowsExternalAi } from "../../src/lib/data-governance/classification";
import { authorizeDataUse } from "../../src/lib/data-governance/policy";
import { createDataVersion, assertValidVersionSequence } from "../../src/lib/data-governance/versioning";
import { canTransitionLifecycle } from "../../src/lib/data-governance/lifecycle";
import { canTransitionVerification } from "../../src/lib/data-governance/verification";

describe("data governance kernel", () => {
  it("blocks external AI for restricted classifications", () => {
    expect(classificationAllowsExternalAi("RESTRICTED")).toBe(false);
    expect(classificationAllowsExternalAi("HIGHLY_RESTRICTED")).toBe(false);
  });

  it("requires an allowed purpose", () => {
    const decision = authorizeDataUse(
      {
        classification: "INTERNAL",
        allowedPurposes: ["OPERATIONS"],
        restricted: false,
        externalAiAllowed: true,
      },
      { classification: "INTERNAL", purpose: "OTHER" },
    );
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("PURPOSE_NOT_ALLOWED");
  });

  it("allows explicitly governed internal use", () => {
    const decision = authorizeDataUse(
      {
        classification: "INTERNAL",
        allowedPurposes: ["OPERATIONS"],
        restricted: false,
        externalAiAllowed: true,
      },
      { classification: "INTERNAL", purpose: "OPERATIONS", requestedExternalAi: true },
    );
    expect(decision.allowed).toBe(true);
  });

  it("enforces lifecycle and verification state machines", () => {
    expect(canTransitionLifecycle("ACTIVE", "ARCHIVED")).toBe(true);
    expect(canTransitionLifecycle("ELIGIBLE_FOR_PURGE", "ACTIVE")).toBe(false);
    expect(canTransitionVerification("DRAFT", "PENDING_VERIFICATION")).toBe(true);
    expect(canTransitionVerification("VERIFIED", "DRAFT")).toBe(false);
  });

  it("requires monotonic immutable version sequencing", () => {
    const first = createDataVersion({ value: "A", changedAt: "2026-09-14T00:00:00Z", reason: "initial" });
    const second = createDataVersion({ value: "B", changedAt: "2026-09-14T01:00:00Z", reason: "correction", previousVersion: first.version });
    expect(assertValidVersionSequence([first, second])).toBe(true);
    expect(assertValidVersionSequence([second])).toBe(false);
  });
});
