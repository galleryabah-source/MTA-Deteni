export const PRIVATE_STORAGE_VERSION="P9.9-IMPLEMENTATION-v2";

function requiredString(value, code){
  if(typeof value!=="string"||!value.trim()) throw new Error(code);
  return value.trim();
}

export function authorizePrivateObjectAccess(input){
  if(input?.authenticated!==true)return {allowed:false,reasonCode:"AUTH_REQUIRED"};
  if(input?.scopeValid!==true)return {allowed:false,reasonCode:"SCOPE_DENIED"};
  if(input?.classificationAllowed!==true)return {allowed:false,reasonCode:"RESOURCE_CLASSIFICATION_DENIED"};
  const objectId=requiredString(input?.objectId,"RESOURCE_ID_REQUIRED");
  return {allowed:true,reasonCode:"ALLOW",objectId};
}

export function buildPrivateObjectMetadata(input){
  const objectId=requiredString(input?.objectId,"STORAGE_METADATA_REQUIRED:objectId");
  const bucket=requiredString(input?.bucket,"STORAGE_METADATA_REQUIRED:bucket");
  const contentType=requiredString(input?.contentType,"STORAGE_METADATA_REQUIRED:contentType");
  const classification=requiredString(input?.classification,"STORAGE_METADATA_REQUIRED:classification");
  const contentHash=requiredString(input?.contentHash,"STORAGE_METADATA_REQUIRED:contentHash");
  if(!Number.isInteger(input?.sizeBytes)||input.sizeBytes<0)throw new Error("STORAGE_METADATA_REQUIRED:sizeBytes");
  if(input?.public===true)throw new Error("PRIVATE_STORAGE_PUBLIC_FORBIDDEN");
  return Object.freeze({version:PRIVATE_STORAGE_VERSION,objectId,bucket,contentType,sizeBytes:input.sizeBytes,classification,contentHash,public:false});
}

export function buildPrivateObjectPath(input){
  const tenantId=requiredString(input?.tenantId,"STORAGE_PATH_TENANT_REQUIRED");
  const objectId=requiredString(input?.objectId,"STORAGE_PATH_OBJECT_REQUIRED");
  if(/[\\/]/.test(tenantId)||/[\\/]/.test(objectId)||tenantId==="."||tenantId===".."||objectId==="."||objectId==="..")throw new Error("STORAGE_PATH_TRAVERSAL_FORBIDDEN");
  return tenantId+"/"+objectId;
}
