export const TEMPORARY_EXIT_REPOSITORY_CONTRACT = Object.freeze([
  'getById',
  'create',
  'update',
  'appendTimeline',
  'saveDocument',
  'saveArtifactGrant',
  'transaction',
]);

export function assertTemporaryExitRepository(repository) {
  for (const method of TEMPORARY_EXIT_REPOSITORY_CONTRACT) {
    if (typeof repository?.[method] !== 'function') throw new Error(`REPOSITORY_CONTRACT_MISSING:${method}`);
  }
  return repository;
}
