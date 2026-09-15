export declare function transition(from: import("../shared/contracts").TemporaryExitState, to: import("../shared/contracts").TemporaryExitState):
  | { readonly ok: true; readonly state: import("../shared/contracts").TemporaryExitState }
  | { readonly ok: false; readonly code: "INVALID_STATE"; readonly from: import("../shared/contracts").TemporaryExitState; readonly to: import("../shared/contracts").TemporaryExitState };
