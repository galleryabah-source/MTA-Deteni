import type { TemporaryExitState } from "../shared/contracts.js";

export declare const TEMPORARY_EXIT_TRANSITIONS: Readonly<Record<TemporaryExitState, readonly TemporaryExitState[]>>;
export declare function canTransition(from: TemporaryExitState, to: TemporaryExitState): boolean;
export declare function transition(from: TemporaryExitState, to: TemporaryExitState):
  | { readonly ok: true; readonly state: TemporaryExitState }
  | { readonly ok: false; readonly code: "INVALID_STATE"; readonly from: TemporaryExitState; readonly to: TemporaryExitState };
