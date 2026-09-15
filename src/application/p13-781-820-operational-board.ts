import type { HeadcountReadModel, DetaineeReadModel } from "./read-model.js";

export type OperationalBoard = Readonly<{
  generatedAt: string;
  headcount: HeadcountReadModel;
  movementQueue: readonly DetaineeReadModel[];
  temporaryExitQueue: readonly DetaineeReadModel[];
  alerts: readonly string[];
  trusted: boolean;
}>;

export function composeOperationalBoard(input: Omit<OperationalBoard, "trusted">): OperationalBoard {
  if (!input.generatedAt.trim()) throw new Error("OPERATIONAL_BOARD_TIMESTAMP_REQUIRED");
  if (input.headcount.totalActive < 0 || !Number.isInteger(input.headcount.totalActive)) throw new Error("OPERATIONAL_BOARD_HEADCOUNT_INVALID");
  if (input.headcount.reconciliation !== "MATCH") return { ...input, trusted: false };
  return { ...input, trusted: true };
}

export function assertTrustedOperationalBoard(board: OperationalBoard): void {
  if (!board.trusted) throw new Error("OPERATIONAL_BOARD_NOT_RECONCILED");
}
