import { createHash } from "node:crypto";

export const CHANGE_CONTROL_MANIFEST_VERSION = "P10.317-324-v1";

const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export function buildChangeControlManifest(input) {
  const required = [
    "changeId",
    "releaseCommit",
    "artifactFingerprint",
    "rollbackReference",
    "approvedBy",
    "approvalReason",
  ];

  for (const key of required) {
    if (!input?.[key]) throw new Error(`CHANGE_CONTROL_FIELD_REQUIRED:${key}`);
  }

  if (input.executionAuthorized !== false) {
    throw new Error("CHANGE_CONTROL_CANNOT_GRANT_EXECUTION_AUTHORIZATION");
  }

  const manifest = {
    version: CHANGE_CONTROL_MANIFEST_VERSION,
    changeId: input.changeId,
    releaseCommit: input.releaseCommit,
    artifactFingerprint: input.artifactFingerprint,
    rollbackReference: input.rollbackReference,
    approvedBy: input.approvedBy,
    approvalReason: input.approvalReason,
    executionAuthorized: false,
    productionCertified: false,
  };

  return { ...manifest, manifestFingerprint: hash(manifest) };
}
