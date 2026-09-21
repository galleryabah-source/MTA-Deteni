export const DATABASE_ADAPTER_VERSION='P9.6-IMPLEMENTATION-v1';
export class DatabaseAdapterError extends Error { constructor(code,message){super(message);this.code=code;} }
export function createDatabaseAdapter(config, driver){
 if(!config?.environment) throw new DatabaseAdapterError('ENVIRONMENT_REQUIRED','environment is required');
 if(!['DEVELOPMENT','TEST','STAGING','PRODUCTION'].includes(config.environment)) throw new DatabaseAdapterError('ENVIRONMENT_INVALID','invalid environment');
 if(config.environment==='PRODUCTION' && config.role==='MIGRATION') throw new DatabaseAdapterError('PRODUCTION_MIGRATION_ROLE_REQUIRES_CHANGE_CONTROL','production migration role is forbidden');
 if(!driver || typeof driver.connect!=='function' || typeof driver.query!=='function' || typeof driver.close!=='function') throw new DatabaseAdapterError('DRIVER_CONTRACT_INVALID','driver must implement connect/query/close');
 let connected=false;
 return Object.freeze({
  version:DATABASE_ADAPTER_VERSION,
  async connect(){await driver.connect();connected=true;return {connected:true};},
  async query(query){if(!connected) throw new DatabaseAdapterError('NOT_CONNECTED','database adapter is not connected'); if(!query?.text) throw new DatabaseAdapterError('QUERY_INVALID','query.text is required'); return driver.query(query);},
  async healthcheck(){if(!connected) return {ok:false,code:'NOT_CONNECTED'}; try{await driver.query({text:'SELECT 1',values:[]});return {ok:true};}catch{return {ok:false,code:'HEALTHCHECK_FAILED'};}},
  async close(){await driver.close();connected=false;return {closed:true};}
 });
}