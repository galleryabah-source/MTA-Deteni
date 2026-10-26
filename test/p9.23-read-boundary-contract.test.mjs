import assert from "node:assert/strict";
import test from "node:test";
import { authorizeProductionRead } from "../src/infrastructure/database/production-read-boundary.ts";

const base={authenticated:true,role:"VIEWER",scopeAllowed:true,classificationAllowed:true};

test("authorized read is allowed",()=>assert.equal(authorizeProductionRead(base),"ALLOW"));
test("unauthenticated read is denied",()=>assert.equal(authorizeProductionRead({...base,authenticated:false}),"AUTH_REQUIRED"));
test("scope restriction is enforced",()=>assert.equal(authorizeProductionRead({...base,scopeAllowed:false}),"SCOPE_DENIED"));
test("classification restriction is enforced",()=>assert.equal(authorizeProductionRead({...base,classificationAllowed:false}),"CLASSIFICATION_DENIED"));
