export const PRIVATE_STORAGE_VERSION='P9.9-IMPLEMENTATION-v1';
export function authorizePrivateObjectAccess(input){
 if(input?.authenticated!==true) return {allowed:false,reasonCode:'AUTH_REQUIRED'};
 if(!input.scopeValid) return {allowed:false,reasonCode:'SCOPE_DENIED'};
 if(!input.classificationAllowed) return {allowed:false,reasonCode:'RESOURCE_CLASSIFICATION_DENIED'};
 if(!input.objectId) return {allowed:false,reasonCode:'RESOURCE_ID_REQUIRED'};
 return {allowed:true,reasonCode:'ALLOW',objectId:input.objectId};
}
export function buildPrivateObjectMetadata(input){
 for(const k of ['objectId','bucket','contentType','sizeBytes','classification'])if(!input?.[k])throw new Error('STORAGE_METADATA_REQUIRED:'+k);
 if(input.public===true)throw new Error('PRIVATE_STORAGE_PUBLIC_FORBIDDEN');
 return Object.freeze({version:PRIVATE_STORAGE_VERSION,...input,public:false});
}