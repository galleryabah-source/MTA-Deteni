import type { Detainee } from "../../domain/core-administration/service.js";

export type DetaineeRow = Readonly<{
  id: string;
  code: string;
  name: string;
  nationality: string;
  status: string;
  placement: string | null;
  source: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
  scope_id: string | null;
}>;

export function detaineeToRow(input: Detainee & {
  code: string;
  name: string;
  nationality: string;
  placement?: string | null;
  scopeId?: string | null;
}): DetaineeRow {
  return Object.freeze({
    id: input.id,
    code: input.code,
    name: input.identityRef,
    nationality: input.provenance.sourceType,
    status: input.status,
    placement: input.placement ?? null,
    source: input.provenance.sourceType,
    created_at: input.createdAt,
    updated_at: input.updatedAt,
    metadata: {
      provenance: {
        sourceType: input.provenance.sourceType,
        capturedAt: input.provenance.capturedAt,
        verified: input.provenance.verified,
        ...(input.provenance.verifiedBy ? { verifiedBy: input.provenance.verifiedBy } : {}),
      },
      domainVersion: input.version,
    },
    scope_id: input.scopeId ?? null,
  });
}
