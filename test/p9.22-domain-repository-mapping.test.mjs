import assert from "node:assert/strict";
import test from "node:test";
import { validateDomainRepositoryMapping, migrationRequiredByMapping } from "../src/infrastructure/database/domain-repository-mapping.ts";

const mapping={domain:"DETAINEE",repositoryName:"DetaineeRepository",tableName:"mta_detainees",contractVersion:"D3-v1",sensitive:true,migrationRequired:false};

test("complete domain mapping is valid",()=>assert.equal(validateDomainRepositoryMapping(mapping),true));
test("mapping does not imply migration",()=>assert.equal(migrationRequiredByMapping(mapping),false));
test("missing repository identity is rejected",()=>assert.equal(validateDomainRepositoryMapping({...mapping,repositoryName:""}),false));
