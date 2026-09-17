export type OfflineConflictResolutionAction = 'ACCEPT_LOCAL' | 'ACCEPT_REMOTE' | 'MERGE' | 'REJECT';

export type OfflineConflictResolution = Readonly<{
  conflictId: string;
  mutationId: string;
  idempotencyKey: string;
  aggregateType: string;
  aggregateId: string;
  baseVersion: string;
  currentVersion: string;
  action: OfflineConflictResolutionAction;
  reviewerId: string;
  rationale: string;
  resolvedVersion: string;
  resolvedAt: string;
  auditEventId: string;
  syntheticOnly: true;
}>;

export function assertOfflineConflictResolution(value: OfflineConflictResolution): void {
  const required = [value.conflictId, value.mutationId, value.idempotencyKey, value.aggregateType, value.aggregateId, value.baseVersion, value.currentVersion, value.reviewerId, value.rationale, value.resolvedVersion, value.resolvedAt, value.auditEventId];
  if (required.some((item) => !item.trim())) throw new Error('Conflict resolution requires complete review and audit identity.');
  if (value.action === 'MERGE' && value.baseVersion === value.currentVersion) throw new Error('MERGE requires a demonstrable version divergence.');
  if (value.syntheticOnly !== true) throw new Error('Conflict resolution must remain synthetic-only.');
}

export function createOfflineConflictResolution(input: Omit<OfflineConflictResolution, 'syntheticOnly'>): OfflineConflictResolution {
  const resolution = Object.freeze({ ...input, syntheticOnly: true as const });
  assertOfflineConflictResolution(resolution);
  return resolution;
}
