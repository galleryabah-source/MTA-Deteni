import assert from "node:assert/strict";
import test from "node:test";
import { loadMtaRuntimeConfig } from "../supabase/functions/_shared/runtime-config.mjs";
import { readFileSync } from "node:fs";

const base = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "anon-secret-value",
  SUPABASE_SERVICE_ROLE_KEY: "service-secret-value",
  MTA_PRODUCTION_WRITES_ENABLED: "false",
  MTA_ENVIRONMENT: "production",
};
const reader = (values) => (name) => values[name];

test("Edge Functions use the shared loader instead of ad hoc environment reads", () => {
  const api = readFileSync(new URL("../supabase/functions/mta-api/index.ts", import.meta.url), "utf8");
  const login = readFileSync(new URL("../supabase/functions/mta-login/index.ts", import.meta.url), "utf8");
  const outbox = readFileSync(new URL("../supabase/functions/mta-outbox-dispatcher/index.ts", import.meta.url), "utf8");
  for (const source of [api, login, outbox]) {
    assert.equal((source.match(/Deno\.env\.get\(/g) || []).length, 1);
    assert.match(source, /loadMtaRuntimeConfig\(\(name\)=>Deno\.env\.get\(name\)/);
  }
  assert.match(outbox, /requireAnonKey:false/);
});

test("runtime config loads required server values and normalizes environment", () => {
  const config = loadMtaRuntimeConfig(reader(base));
  assert.equal(config.supabaseUrl, "https://example.supabase.co");
  assert.equal(config.environment, "PRODUCTION");
  assert.equal(config.productionWritesRequested, false);
  assert.equal(config.productionWritesEnabled, false);
  assert.equal(Object.isFrozen(config), true);
});

test("production writes require both explicit true and PRODUCTION environment", () => {
  const enabled = loadMtaRuntimeConfig(reader({
    ...base,
    MTA_PRODUCTION_WRITES_ENABLED: "true",
    MTA_ENVIRONMENT: "production",
  }));
  assert.equal(enabled.productionWritesEnabled, true);

  const staging = loadMtaRuntimeConfig(reader({
    ...base,
    MTA_PRODUCTION_WRITES_ENABLED: "true",
    MTA_ENVIRONMENT: "staging",
  }));
  assert.equal(staging.productionWritesRequested, true);
  assert.equal(staging.productionWritesEnabled, false);

  const unspecified = loadMtaRuntimeConfig(reader({
    ...base,
    MTA_PRODUCTION_WRITES_ENABLED: "true",
    MTA_ENVIRONMENT: undefined,
  }));
  assert.equal(unspecified.environment, "UNSPECIFIED");
  assert.equal(unspecified.productionWritesEnabled, false);
});

test("outbox dispatcher can use the least-privilege config profile without anon key", () => {
  const config = loadMtaRuntimeConfig(reader({
    SUPABASE_URL: base.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: base.SUPABASE_SERVICE_ROLE_KEY,
    MTA_ENVIRONMENT: "production",
  }), { requireAnonKey: false });
  assert.equal(config.supabaseAnonKey, "");
  assert.equal(config.supabaseServiceRoleKey, base.SUPABASE_SERVICE_ROLE_KEY);
});

test("missing required variables fail fast without exposing secret values", () => {
  const invalid = { ...base, SUPABASE_SERVICE_ROLE_KEY: "" };
  assert.throws(
    () => loadMtaRuntimeConfig(reader(invalid)),
    (error) => {
      assert.match(error.message, /MTA_CONFIG_MISSING:SUPABASE_SERVICE_ROLE_KEY/);
      assert.equal(error.message.includes("anon-secret-value"), false);
      assert.equal(error.message.includes("service-secret-value"), false);
      return true;
    },
  );
});

test("Supabase URL rejects unsafe schemes and embedded credentials/query", () => {
  for (const url of [
    "http://supabase.example.com",
    "https://user:password@example.supabase.co",
    "https://example.supabase.co?token=secret",
    "https://example.supabase.co#fragment",
    "https://example.supabase.co/functions",
    "not-a-url",
  ]) {
    assert.throws(
      () => loadMtaRuntimeConfig(reader({ ...base, SUPABASE_URL: url })),
      /MTA_CONFIG_INVALID:SUPABASE_URL/,
    );
  }
});

test("local HTTP is allowed only for loopback development", () => {
  const config = loadMtaRuntimeConfig(reader({
    ...base,
    SUPABASE_URL: "http://127.0.0.1:54321/",
    MTA_ENVIRONMENT: "local",
  }));
  assert.equal(config.supabaseUrl, "http://127.0.0.1:54321");
  assert.throws(
    () => loadMtaRuntimeConfig(reader({
      ...base,
      SUPABASE_URL: "http://192.168.1.10:54321",
    })),
    /MTA_CONFIG_INVALID:SUPABASE_URL_PROTOCOL/,
  );
  assert.throws(
    () => loadMtaRuntimeConfig(reader({
      ...base,
      SUPABASE_URL: "http://localhost:54321",
      MTA_ENVIRONMENT: "production",
    })),
    /MTA_CONFIG_INVALID:SUPABASE_URL_PROTOCOL/,
  );
});

test("service and anon keys must be distinct", () => {
  assert.throws(
    () => loadMtaRuntimeConfig(reader({
      ...base,
      SUPABASE_SERVICE_ROLE_KEY: base.SUPABASE_ANON_KEY,
    })),
    /MTA_CONFIG_INVALID:KEY_SEPARATION/,
  );
});

test("production write flag accepts only exact lowercase boolean literals", () => {
  for (const value of ["TRUE", "False", " true", "false ", "yes", "1"]) {
    assert.throws(
      () => loadMtaRuntimeConfig(reader({ ...base, MTA_PRODUCTION_WRITES_ENABLED: value })),
      /MTA_CONFIG_INVALID:MTA_PRODUCTION_WRITES_ENABLED/,
    );
  }
});

test("invalid environment and production write flag fail closed", () => {
  assert.throws(
    () => loadMtaRuntimeConfig(reader({ ...base, MTA_ENVIRONMENT: "prod-ish" })),
    /MTA_CONFIG_INVALID:MTA_ENVIRONMENT/,
  );
  assert.throws(
    () => loadMtaRuntimeConfig(reader({ ...base, MTA_PRODUCTION_WRITES_ENABLED: "yes" })),
    /MTA_CONFIG_INVALID:MTA_PRODUCTION_WRITES_ENABLED/,
  );
});

console.log("MTA P9.2 runtime configuration contract PASS");
