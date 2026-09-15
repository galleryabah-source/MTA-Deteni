import { strict as assert } from "node:assert";
import { assertOperationalInvariants, assertLeadershipIsOversightOnly, assertTemporaryExitDoesNotBecomeDeportation } from "../src/application/p13-3121-3160-cross-domain-invariants.js";
import { assertOperationalDataContract } from "../src/application/p13-3161-3200-operational-data-contract-audit.js";
import { assertReportTemplateFidelity } from "../src/application/p13-3201-3240-report-template-fidelity.js";
import { assertSyntheticIntegrationCertification } from "../src/application/p13-3241-3280-synthetic-integration-certification.js";
import { assertProductionBarrier } from "../src/application/p13-3281-3320-production-barrier.js";

assertOperationalInvariants([{ invariantId: "INV-1", owner: "RAP", description: "synthetic authority record", satisfied: true }]);
assertLeadershipIsOversightOnly("HEAD_RUDENIM", false);
assert.throws(() => assertTemporaryExitDoesNotBecomeDeportation("DEPORTATION"), /TEMPORARY_EXIT_DEPORTATION_COLLISION/);
assertOperationalDataContract({ contractId: "RAP-1", domain: "RAP", fields: [{ name: "status", required: true, authoritative: true, syntheticAllowed: true }] });
assertReportTemplateFidelity({ templateId: "daily-guard", format: "PDF", exactLayoutRequired: true, elements: [{ key: "title", required: true, order: 1, sourceField: "report.title" }] });
assertSyntheticIntegrationCertification({ certificationId: "CERT-1", controls: [{ controlId: "CTRL-1", evidenceId: "E-1", executed: true, passed: true }], syntheticOnly: true, migrationFreeze: true, aiEnabled: false, productionAuthorized: false });
assertProductionBarrier({ productionAuthorized: false, migrationFreeze: true, aiEnabled: false, realDataPresent: false, liveDatabaseApproved: false });
