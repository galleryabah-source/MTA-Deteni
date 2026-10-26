export const RESTRICTED_DOMAIN_CONTRACT_VERSION="P10.11-INFERRED-v2";
export type AccessContext={authenticated:boolean;scopeAllowed:boolean;classificationAllowed:boolean};
export type AccessDecision="AUTHORIZED"|"AUTH_REQUIRED"|"SCOPE_DENIED"|"CLASSIFICATION_DENIED";
export function decideRestrictedAccess(c:AccessContext):AccessDecision{if(!c.authenticated)return"AUTH_REQUIRED";if(!c.scopeAllowed)return"SCOPE_DENIED";if(!c.classificationAllowed)return"CLASSIFICATION_DENIED";return"AUTHORIZED";}