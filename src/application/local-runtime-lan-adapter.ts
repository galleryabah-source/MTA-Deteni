import type { LocalRuntimeLanAdapterContract } from './local-runtime-lan-adapter-contract.js';
import { assertLocalRuntimeLanAdapterContract } from './local-runtime-lan-adapter-contract.js';
import { LocalRuntimeOfflineMutationQueue } from './local-runtime-offline-mutation-queue.js';
import type { OfflineMutation, OfflineMutationDisposition } from './local-runtime-offline-mutation-contract.js';

export class LocalRuntimeLanAdapter {
  readonly queue = new LocalRuntimeOfflineMutationQueue();

  constructor(readonly contract: LocalRuntimeLanAdapterContract) {
    assertLocalRuntimeLanAdapterContract(contract);
  }

  queueMutation(mutation: OfflineMutation): void { this.queue.enqueue(mutation); }

  admitMutation(mutation: OfflineMutation, currentVersion: string): OfflineMutationDisposition {
    return this.queue.admit(mutation, currentVersion);
  }
}
