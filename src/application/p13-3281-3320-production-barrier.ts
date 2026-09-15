export type ProductionBarrier = Readonly<{
  productionAuthorized: false;
  migrationFreeze: true;
  aiEnabled: false;
  realDataPresent: false;
  liveDatabaseApproved: false;
}>;

export function assertProductionBarrier(barrier: ProductionBarrier): void {
  if (barrier.productionAuthorized || !barrier.migrationFreeze || barrier.aiEnabled || barrier.realDataPresent || barrier.liveDatabaseApproved) throw new Error("PRODUCTION_BARRIER_BLOCKED");
}
