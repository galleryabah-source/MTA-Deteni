import type { DataVersion } from "./types";

export const createDataVersion = <T>(input: {
  value: T;
  changedAt: string;
  changedBy?: string;
  reason: string;
  previousVersion?: number;
}): DataVersion<T> => ({
  version: (input.previousVersion ?? 0) + 1,
  value: input.value,
  changedAt: input.changedAt,
  changedBy: input.changedBy,
  reason: input.reason,
  previousVersion: input.previousVersion,
});

export const assertValidVersionSequence = <T>(versions: readonly DataVersion<T>[]): boolean =>
  versions.every((version, index) =>
    index === 0
      ? version.version === 1 && version.previousVersion === undefined
      : version.version === versions[index - 1].version + 1 &&
        version.previousVersion === versions[index - 1].version,
  );
