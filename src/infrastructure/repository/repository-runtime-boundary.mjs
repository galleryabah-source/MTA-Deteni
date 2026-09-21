export const REPOSITORY_RUNTIME_VERSION='P9.15-v2';
export function createRepositoryBoundary(adapter,table){
 if(!adapter||typeof adapter.query!=='function')throw new Error('REPOSITORY_ADAPTER_REQUIRED');
 if(!/^mta_[a-z_]+$/.test(table))throw new Error('REPOSITORY_TABLE_INVALID');
 return Object.freeze({
  async list(){return adapter.query({text:`SELECT * FROM ${table}`,values:[]})},
  async getById(id){if(!id)throw new Error('RESOURCE_ID_REQUIRED');return adapter.query({text:`SELECT * FROM ${table} WHERE id=$1`,values:[id]})},
  async insert(){throw new Error('REPOSITORY_MUTATION_MAPPING_REQUIRED')},
  async update(){throw new Error('REPOSITORY_MUTATION_MAPPING_REQUIRED')},
  async remove(){throw new Error('REPOSITORY_MUTATION_MAPPING_REQUIRED')}
 });
}