export type LocalRuntimeTransport = 'LAN_HTTP' | 'BROWSER_LOCAL';
export type LocalRuntimePersistence = 'LOCAL_POSTGRESQL' | 'BROWSER_LOCAL_STORAGE';

export type LocalRuntimeLanAdapterContract = Readonly<{
  adapterId: string;
  transport: LocalRuntimeTransport;
  persistence: LocalRuntimePersistence;
  hostBoundary: 'LOCAL_NETWORK_ONLY';
  databaseBoundary: 'NONPRODUCTION_LOCAL_ONLY';
  authentication: 'REQUIRED';
  authorization: 'DENY_BY_DEFAULT';
  audit: 'REQUIRED';
  offlineQueue: 'REQUIRED';
  idempotency: 'REQUIRED';
  conflictPolicy: 'REVIEW_REQUIRED';
  syntheticOnly: true;
}>;

export function assertLocalRuntimeLanAdapterContract(contract: LocalRuntimeLanAdapterContract): void {
  if (!contract.adapterId.trim()) throw new Error('Local runtime adapter identity is required.');
  if (contract.hostBoundary !== 'LOCAL_NETWORK_ONLY') throw new Error('LAN adapter must remain local-network-only.');
  if (contract.databaseBoundary !== 'NONPRODUCTION_LOCAL_ONLY') throw new Error('LAN adapter database boundary violation.');
  if (contract.authentication !== 'REQUIRED' || contract.authorization !== 'DENY_BY_DEFAULT') throw new Error('LAN adapter security boundary violation.');
  if (contract.audit !== 'REQUIRED' || contract.offlineQueue !== 'REQUIRED' || contract.idempotency !== 'REQUIRED') throw new Error('LAN adapter control requirement missing.');
  if (contract.conflictPolicy !== 'REVIEW_REQUIRED') throw new Error('LAN conflict must require review.');
  if (contract.syntheticOnly !== true) throw new Error('LAN adapter must remain synthetic-only.');
}
