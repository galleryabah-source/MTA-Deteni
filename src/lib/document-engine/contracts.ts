import type { DocumentContract } from "./types";

const common = [
  { name: "deteniId", required: true, sensitive: true, format: "TEXT" as const },
  { name: "deteniName", required: true, sensitive: true, format: "TEXT" as const },
  { name: "nationality", required: true, sensitive: false, format: "TEXT" as const },
  { name: "purpose", required: true, format: "TEXT" as const },
  { name: "departureAt", required: true, format: "DATETIME" as const },
  { name: "returnAt", required: true, format: "DATETIME" as const },
];

export const TEMPORARY_EXIT_LETTER_CONTRACT: DocumentContract = {
  contractId: "MTA-DETENI-DOC-001",
  kind: "SURAT_IZIN_KELUAR_SEMENTARA",
  version: "1.0.0",
  fields: [...common, { name: "documentNumber", required: true, format: "TEXT" as const }],
  requiredApproval: true,
};

export const ESCORT_ASSIGNMENT_LETTER_CONTRACT: DocumentContract = {
  contractId: "MTA-DETENI-DOC-002",
  kind: "SURAT_TUGAS_PENGAWALAN",
  version: "1.0.0",
  fields: [
    ...common,
    { name: "documentNumber", required: true, format: "TEXT" as const },
    { name: "escortOfficerId", required: true, sensitive: true, format: "TEXT" as const },
    { name: "escortOfficerName", required: true, sensitive: true, format: "TEXT" as const },
  ],
  requiredApproval: true,
};

export const MTA_DETENI_DOCUMENT_CONTRACTS = [
  TEMPORARY_EXIT_LETTER_CONTRACT,
  ESCORT_ASSIGNMENT_LETTER_CONTRACT,
] as const;
