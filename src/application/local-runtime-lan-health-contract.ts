export type LanRuntimeHealth = Readonly<{
  service: 'MTA_DETENI_LAN_RUNTIME';
  runtimeId: string;
  protocol: 'HTTP';
  scope: 'LOCAL_NETWORK_ONLY';
  authentication: 'REQUIRED';
  authorization: 'DENY_BY_DEFAULT';
  database: 'LOCAL_POSTGRESQL_NONPRODUCTION_ONLY' | 'BROWSER_LOCAL_ONLY';
  queue: 'DURABLE_REQUIRED';
  syntheticOnly: true;
}>;

export function createLanRuntimeHealth(runtimeId: string, database: LanRuntimeHealth['database']): LanRuntimeHealth {
  if (!runtimeId.trim()) throw new Error('LAN runtime identity is required.');
  return Object.freeze({ service: 'MTA_DETENI_LAN_RUNTIME', runtimeId, protocol: 'HTTP', scope: 'LOCAL_NETWORK_ONLY', authentication: 'REQUIRED', authorization: 'DENY_BY_DEFAULT', database, queue: 'DURABLE_REQUIRED', syntheticOnly: true });
}

export function assertLanRuntimeHealth(value: LanRuntimeHealth): void {
  if (value.scope !== 'LOCAL_NETWORK_ONLY' || value.authentication !== 'REQUIRED' || value.authorization !== 'DENY_BY_DEFAULT') throw new Error('LAN health contract boundary violated.');
  if (value.syntheticOnly !== true) throw new Error('LAN health must remain synthetic-only.');
}
