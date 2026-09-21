export const DOMAIN_REPOSITORY_MAPPING_VERSION = "P9.22-v1";

export interface DomainRepositoryMapping {
  domain: "DETAINEE" | "PLACEMENT" | "MOVEMENT" | "LEAVE" | "ESCORT" | "DOCUMENT";
  repositoryName: string;
  tableName: string;
  contractVersion: string;
  sensitive: boolean;
  migrationRequired: boolean;
}

export function validateDomainRepositoryMapping(mapping: DomainRepositoryMapping): boolean {
  return Boolean(
    mapping.domain &&
    mapping.repositoryName &&
    mapping.tableName &&
    mapping.contractVersion
  );
}

export function migrationRequiredByMapping(mapping: DomainRepositoryMapping): boolean {
  return mapping.migrationRequired;
}
