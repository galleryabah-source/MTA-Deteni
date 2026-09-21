export const TRANSACTION_IDEMPOTENCY_VERSION='P9.7-IMPLEMENTATION-v1';
export class TransactionError extends Error { constructor(code,message){super(message);this.code=code;} }
export function createTransactionRunner(adapter){
 if(!adapter||typeof adapter.query!=='function') throw new TransactionError('ADAPTER_REQUIRED','database adapter required');
 return Object.freeze({
  async transaction(work){
   if(typeof work!=='function') throw new TransactionError('WORK_REQUIRED','transaction work function required');
   await adapter.query({text:'BEGIN',values:[]});
   try{const result=await work({transactionId:crypto.randomUUID()});await adapter.query({text:'COMMIT',values:[]});return result}
   catch(error){try{await adapter.query({text:'ROLLBACK',values:[]})}finally{throw error}}
  }
 });
}
export function createIdempotencyStore(){
 const records=new Map();
 return Object.freeze({
  begin(key,requestHash){if(!key||!requestHash)throw new TransactionError('IDEMPOTENCY_INPUT_REQUIRED','key and requestHash required');const old=records.get(key);if(!old){records.set(key,{key,requestHash,status:'IN_PROGRESS'});return{status:'ACQUIRED'}}if(old.requestHash!==requestHash)throw new TransactionError('IDEMPOTENCY_CONFLICT','request hash differs');if(old.status==='COMPLETED')return{status:'REPLAY',responseHash:old.responseHash};return{status:'IN_PROGRESS'}},
  complete(key,responseHash){const r=records.get(key);if(!r)throw new TransactionError('IDEMPOTENCY_NOT_FOUND','record not found');if(r.status!=='IN_PROGRESS')throw new TransactionError('IDEMPOTENCY_NOT_IN_PROGRESS','record not in progress');r.status='COMPLETED';r.responseHash=responseHash;return{status:'COMPLETED'}}
 });
}