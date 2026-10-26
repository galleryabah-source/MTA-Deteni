export const DOCUMENT_USECASE_CONTRACT_VERSION="P10.16-INFERRED-v1";
export type DocumentActor={userId:string;permission:"document.view"|"document.generate"|"document.issue";authenticated:boolean;scopeAllowed:boolean};
export type DocumentDecision="ALLOWED"|"AUTH_REQUIRED"|"SCOPE_DENIED"|"PERMISSION_DENIED";
const ID=/^[A-Za-z0-9._-]{1,128}$/;
export function authorizeDocument(actor:DocumentActor,action:"VIEW"|"GENERATE"|"ISSUE"):DocumentDecision{if(!actor.authenticated||!ID.test(actor.userId))return"AUTH_REQUIRED";if(!actor.scopeAllowed)return"SCOPE_DENIED";const p=action==="VIEW"?"document.view":action==="GENERATE"?"document.generate":"document.issue";return actor.permission===p?"ALLOWED":"PERMISSION_DENIED";}