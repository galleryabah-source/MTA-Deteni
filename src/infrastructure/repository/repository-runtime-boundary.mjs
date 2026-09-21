export const REPOSITORY_RUNTIME_VERSION='P9.15-v1';
export function createRepositoryBoundary(adapter,table){
 if(!adapter||typeof adapter.query!=='function')throw new Error('REPOSITORY_ADAPTER_REQUIRED');
 if(!/^mta_[a-z_]+$/.test(table))throw new Error('REPOSITORY_TABLE_INVALID');
 return Object.freeze({
  async list(){return adapter.query({text:`SELECT * FROM ${table}`,values:[]})},
  async getById(id){if(!id)throw new Error('RESOURCE_ID_REQUIRED');return adapter.query({text:`SELECT * FROM ${table} WHERE id=$1`,values:[id]})},
  async insert(payload){if(!payload||typeof payload!=='object')throw new Error('PAYLOAD_REQUIRED');return adapter.query({text:`INSERT INTO ${table} DEFAULT VALUES RETURNING *`,values:[]})},
  async update(id,payload){if(!id)throw new Error('RESOURCE_ID_REQUIRED');return adapter.query({text:`UPDATE ${table} SET updated_at=updated_at WHERE id=$1 RETURNING *`,values:[id]})},
  async remove(id){if(!id)throw new Error('RESOURCE_ID_REQUIRED');return adapter.query({text:`DELETE FROM ${table} WHERE id=$1 RETURNING id`,values:[id]})}
 });
}