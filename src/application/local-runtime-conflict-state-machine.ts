import type { OfflineConflictResolution, OfflineConflictResolutionAction } from './local-runtime-conflict-resolution-contract.js';
import { assertOfflineConflictResolution } from './local-runtime-conflict-resolution-contract.js';

export type ConflictState = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

export type OfflineConflictRecord = Readonly<{
  conflictId: string;
  mutationId: string;
  state: ConflictState;
  baseVersion: string;
  currentVersion: string;
  action?: OfflineConflictResolutionAction;
  syntheticOnly: true;
}>;

export function createOfflineConflictRecord(input: Omit<OfflineConflictRecord, 'state' | 'syntheticOnly'>): OfflineConflictRecord {
  return Object.freeze({ ...input, state: 'OPEN' as const, syntheticOnly: true as const });
}

export function transitionOfflineConflict(record: OfflineConflictRecord, next: 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED', resolution?: OfflineConflictResolution): OfflineConflictRecord {
  if (next === 'UNDER_REVIEW') {
    if (record.state !== 'OPEN') throw new Error('Only OPEN conflicts can enter review.');
    return Object.freeze({ ...record, state: next });
  }
  if (record.state !== 'UNDER_REVIEW') throw new Error('Conflict must be UNDER_REVIEW before final disposition.');
  if (!resolution) throw new Error('Final conflict transition requires reviewed resolution evidence.');
  assertOfflineConflictResolution(resolution);
  if (resolution.conflictId !== record.conflictId || resolution.mutationId !== record.mutationId) throw new Error('Conflict resolution identity mismatch.');
  return Object.freeze({ ...record, state: next, action: resolution.action });
}
