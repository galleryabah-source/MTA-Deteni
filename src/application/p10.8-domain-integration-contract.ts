export const P10_8_INTEGRATION_VERSION="P10.8-INTEGRATION-v1";

export type IntegrationEvidence = Readonly<{
  journeyId:string;
  detaineeRegistered:boolean;
  placementActive:boolean;
  leaveApproved:boolean;
  documentBound:boolean;
  escortAssigned:boolean;
  departureMovement:boolean;
  returnMovement:boolean;
  completed:boolean;
  auditEvents:number;
  outboxEvents:number;
  replayed:boolean;
}>;

export function assertGoldenJourney(e:IntegrationEvidence):void {
  const required=["detaineeRegistered","placementActive","leaveApproved","documentBound","escortAssigned","departureMovement","returnMovement","completed"] as const;
  for(const key of required) if(!e[key]) throw new Error(`P10.8_INTEGRATION_INCOMPLETE:${key}`);
  if(e.auditEvents<1) throw new Error("P10.8_AUDIT_EVIDENCE_MISSING");
  if(e.outboxEvents<1) throw new Error("P10.8_OUTBOX_EVIDENCE_MISSING");
  if(!e.replayed) throw new Error("P10.8_IDEMPOTENCY_REPLAY_NOT_VERIFIED");
}
export function assertNoDuplicateEvidence(e:{auditEventIds:readonly string[];outboxEventIds:readonly string[]}):void {
  if(new Set(e.auditEventIds).size!==e.auditEventIds.length) throw new Error("P10.8_DUPLICATE_AUDIT_EVIDENCE");
  if(new Set(e.outboxEventIds).size!==e.outboxEventIds.length) throw new Error("P10.8_DUPLICATE_OUTBOX_EVIDENCE");
}
