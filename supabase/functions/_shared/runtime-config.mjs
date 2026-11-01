/**
 * @typedef {Object} MtaRuntimeConfig
 * @property {string} supabaseUrl
 * @property {string} supabaseAnonKey
 * @property {string} supabaseServiceRoleKey
 * @property {string} environment
 * @property {boolean} productionWritesRequested
 * @property {boolean} productionWritesEnabled
 */

/**
 * Shared, fail-closed runtime configuration contract for MTA DETENI Edge Functions.
 * Values are read once at module initialization. Secret values are never included
 * in validation errors or returned diagnostics.
 *
 * @param {(name: string) => string | undefined} readEnv
 * @param {{requireAnonKey?: boolean}} [options]
 * @returns {Readonly<MtaRuntimeConfig>}
 */
export function loadMtaRuntimeConfig(readEnv, options = {}) {
  if (typeof readEnv !== "function") {
    throw new Error("MTA_CONFIG_READER_REQUIRED");
  }

  const supabaseUrlRaw = String(readEnv("SUPABASE_URL") ?? "").trim();
  const supabaseAnonKey = String(readEnv("SUPABASE_ANON_KEY") ?? "").trim();
  const requireAnonKey = options.requireAnonKey !== false;
  const supabaseServiceRoleKey = String(readEnv("SUPABASE_SERVICE_ROLE_KEY") ?? "").trim();
  const writeFlagRaw = String(readEnv("MTA_PRODUCTION_WRITES_ENABLED") ?? "").trim().toLowerCase();
  const environmentRaw = String(readEnv("MTA_ENVIRONMENT") ?? "UNSPECIFIED").trim().toUpperCase();

  const missing = [];
  if (!supabaseUrlRaw) missing.push("SUPABASE_URL");
  if (requireAnonKey && !supabaseAnonKey) missing.push("SUPABASE_ANON_KEY");
  if (!supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length) {
    throw new Error("MTA_CONFIG_MISSING:" + missing.join(","));
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(supabaseUrlRaw);
  } catch {
    throw new Error("MTA_CONFIG_INVALID:SUPABASE_URL");
  }
  const localEnvironment = ["LOCAL", "DEVELOPMENT", "TEST"].includes(environmentRaw);
  const localHttp = parsedUrl.protocol === "http:" && localEnvironment &&
    ["localhost", "127.0.0.1", "::1", "[::1]"].includes(parsedUrl.hostname);
  if (parsedUrl.protocol !== "https:" && !localHttp) {
    throw new Error("MTA_CONFIG_INVALID:SUPABASE_URL_PROTOCOL");
  }
  if (parsedUrl.username || parsedUrl.password || parsedUrl.search || parsedUrl.hash || parsedUrl.pathname !== "/") {
    throw new Error("MTA_CONFIG_INVALID:SUPABASE_URL_COMPONENTS");
  }

  const allowedEnvironments = new Set(["PRODUCTION", "STAGING", "DEVELOPMENT", "TEST", "LOCAL", "UNSPECIFIED"]);
  if (!allowedEnvironments.has(environmentRaw)) {
    throw new Error("MTA_CONFIG_INVALID:MTA_ENVIRONMENT");
  }
  if (supabaseAnonKey && supabaseAnonKey === supabaseServiceRoleKey) {
    throw new Error("MTA_CONFIG_INVALID:KEY_SEPARATION");
  }
  if (writeFlagRaw && writeFlagRaw !== "true" && writeFlagRaw !== "false") {
    throw new Error("MTA_CONFIG_INVALID:MTA_PRODUCTION_WRITES_ENABLED");
  }

  const productionWritesRequested = writeFlagRaw === "true";
  const productionWritesEnabled = productionWritesRequested && environmentRaw === "PRODUCTION";

  return Object.freeze({
    supabaseUrl: parsedUrl.toString().replace(/\/+$/, ""),
    supabaseAnonKey,
    supabaseServiceRoleKey,
    environment: environmentRaw,
    productionWritesRequested,
    productionWritesEnabled,
  });
}
