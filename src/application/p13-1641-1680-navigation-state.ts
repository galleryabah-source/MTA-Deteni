import type { WorkbenchSection } from "./p13-601-660-operator-workbench.js";

export type NavigationState = Readonly<{
  current: WorkbenchSection;
  history: readonly WorkbenchSection[];
}>;

export function createNavigationState(initial: WorkbenchSection): NavigationState {
  return { current: initial, history: [initial] };
}

export function navigate(state: NavigationState, next: WorkbenchSection): NavigationState {
  return { current: next, history: [...state.history, next] };
}

export function assertNavigationState(state: NavigationState): void {
  if (!state.current || state.history.length === 0) throw new Error("NAVIGATION_STATE_INVALID");
  if (state.history[state.history.length - 1] !== state.current) throw new Error("NAVIGATION_HISTORY_DRIFT");
}
