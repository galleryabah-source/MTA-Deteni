import type { TemporaryExitState } from "../shared/contracts.js";

export declare const TEMPORARY_EXIT_TRANSITIONS: Readonly<Record<TemporaryExitState, readonly TemporaryExitState[]>>;
export declare function canTransition(from: TemporaryExitState, to: TemporaryExitState): boolean;
export declare function transition(from: TemporaryExitState, to: TemporaryExitState):
  | { ok: true; state: TemporaryExitState }
  | { ok: false; code: "INVALID_STATE"; from: TemporaryExitState; to: TemporaryExitState };
