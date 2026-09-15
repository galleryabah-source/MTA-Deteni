import { assertPreCertificationReady } from "../src/application/p13-3681-3720-precertification-gate.js";

assertPreCertificationReady({ syntheticJourney: true, reportDeterminism: true, rolePermissionRegression: true, offlineOnlineReconciliation: true, evidencePackage: true, migrationFreeze: true, aiEnabled: false, productionAuthorized: false });
