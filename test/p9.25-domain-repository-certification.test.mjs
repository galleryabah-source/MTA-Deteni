import assert from "node:assert/strict"; import test from "node:test"; import {certifyDomainRepository} from "../src/infrastructure/certification/domain-repository-contract-certification.ts";
const b={domain:"LEAVE",mapping:"PASS",context:"PASS",transaction:"PASS"};
test("complete repository evidence certifies",()=>assert.equal(certifyDomainRepository(b),"CERTIFIED"));
test("unverified mapping does not certify",()=>assert.equal(certifyDomainRepository({...b,mapping:"UNVERIFIED"}),"NOT_CERTIFIED"));
test("missing transaction evidence does not certify",()=>assert.equal(certifyDomainRepository({...b,transaction:"FAIL"}),"NOT_CERTIFIED"));