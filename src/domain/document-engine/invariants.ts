import { DomainError } from "../shared/errors.js";
import type { DocumentArtifact } from "./service.js";

export function assertDocumentIdentity(input:{id:string;aggregateId:string;templateId:string;templateVersion:string;numberingRef:string;contentHash:string;actorId:string}):void {
  for (const [name,value] of Object.entries(input)) if (!value.trim()) throw new DomainError("VALIDATION_FAILED", `Document ${name} is required.`);
}

export function assertSha256(contentHash:string):void {
  if (!/^[a-f0-9]{64}$/i.test(contentHash)) throw new DomainError("VALIDATION_FAILED","Document integrity hash must be SHA-256.");
}

export function assertPrivateStorageBinding(input:{bucket:string;objectPath:string;public:boolean;sha256:string}):void {
  if (!input.bucket.trim() || !input.objectPath.trim()) throw new DomainError("VALIDATION_FAILED","Private storage binding is required.");
  if (input.public) throw new DomainError("RESTRICTED_DATA","Document evidence cannot be public.");
  assertSha256(input.sha256);
}

export function assertRevision(input:{revision:number;previousRevision?:number}):void {
  if (!Number.isInteger(input.revision) || input.revision < 1) throw new DomainError("VALIDATION_FAILED","Document revision must be a positive integer.");
  if (input.previousRevision !== undefined && input.revision !== input.previousRevision + 1) {
    throw new DomainError("CONFLICT","Document revision must increment sequentially.");
  }
}

export function assertEvidenceForStatus(input:{status:DocumentArtifact["status"];privateObjectBound:boolean;integrityVerified:boolean;approved:boolean}):void {
  if ((input.status==="APPROVED" || input.status==="ISSUED") && !input.privateObjectBound) throw new DomainError("INVALID_STATE","Approved/issued document requires private storage evidence.");
  if (input.status==="ISSUED" && (!input.integrityVerified || !input.approved)) throw new DomainError("INVALID_STATE","Issued document requires verified integrity and approval.");
}
