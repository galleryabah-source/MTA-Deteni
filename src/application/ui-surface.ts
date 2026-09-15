export type UiSurface =
  | "DASHBOARD"
  | "DETAINEE"
  | "MOVEMENT"
  | "TEMPORARY_EXIT"
  | "QR"
  | "REPORTS";

export type UiReadModel = Readonly<{
  surface: UiSurface;
  title: string;
  summary: readonly { label: string; value: string }[];
  actions: readonly { id: string; label: string; method: "READ" | "MUTATE" }[];
}>;

const surfaces: Record<UiSurface, UiReadModel> = {
  DASHBOARD: { surface: "DASHBOARD", title: "Dashboard", summary: [], actions: [] },
  DETAINEE: { surface: "DETAINEE", title: "Detainee", summary: [], actions: [] },
  MOVEMENT: { surface: "MOVEMENT", title: "Movement & Headcount", summary: [], actions: [] },
  TEMPORARY_EXIT: { surface: "TEMPORARY_EXIT", title: "Temporary Exit", summary: [], actions: [] },
  QR: { surface: "QR", title: "QR Verification", summary: [], actions: [] },
  REPORTS: { surface: "REPORTS", title: "Reports", summary: [], actions: [] },
};

export function createUiReadModel(surface: UiSurface, summary: UiReadModel["summary"] = [], actions: UiReadModel["actions"] = []): UiReadModel {
  return { ...surfaces[surface], summary: [...summary], actions: [...actions] };
}

export function assertUiMutationHasServerBoundary(action: UiReadModel["actions"][number]): void {
  if (action.method === "MUTATE" && !action.id.trim()) throw new Error("Mutation action requires an explicit server-bound action id.");
}
