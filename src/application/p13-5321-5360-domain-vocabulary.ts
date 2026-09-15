export const CANONICAL_DOMAINS = ["RAP", "PERKES", "KAMTIB", "SUBBAG_TU", "HEAD_RUDENIM"] as const;

export type CanonicalDomain = (typeof CANONICAL_DOMAINS)[number];

/**
 * Compatibility mapping only. New application contracts should use HEAD_RUDENIM.
 * This does not grant additional permissions or imply operational mutation rights.
 */
export function normalizeDomain(domain: string): CanonicalDomain {
  if (domain === "LEADERSHIP") return "HEAD_RUDENIM";
  if ((CANONICAL_DOMAINS as readonly string[]).includes(domain)) return domain as CanonicalDomain;
  throw new Error(`DOMAIN_NOT_RECOGNIZED:${domain}`);
}

export function assertHeadRudenimOversightOnly(domain: CanonicalDomain, canMutateOperationalData: boolean): void {
  if (domain === "HEAD_RUDENIM" && canMutateOperationalData) throw new Error("HEAD_RUDENIM_OPERATIONAL_MUTATION_BLOCKED");
}
