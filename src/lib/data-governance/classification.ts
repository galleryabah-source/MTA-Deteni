import type { DataClassification } from "./types";

const ORDER: Record<DataClassification, number> = {
  PUBLIC: 0,
  INTERNAL: 1,
  RESTRICTED: 2,
  HIGHLY_RESTRICTED: 3,
};

export const isAtLeastClassification = (
  actual: DataClassification,
  required: DataClassification,
): boolean => ORDER[actual] >= ORDER[required];

export const maxClassification = (
  left: DataClassification,
  right: DataClassification,
): DataClassification => (ORDER[left] >= ORDER[right] ? left : right);

export const classificationAllowsExternalAi = (
  classification: DataClassification,
): boolean => classification === "PUBLIC" || classification === "INTERNAL";
