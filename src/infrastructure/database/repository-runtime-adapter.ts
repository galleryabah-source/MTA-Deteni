export const REPOSITORY_RUNTIME_ADAPTER_VERSION = "P9.28-v1";
export interface RuntimeQuery { text:string; values:unknown[]; }
export interface RuntimeQueryResult<T> { rows:T[]; rowCount:number; }
export interface RuntimeDatabasePort { query<T>(query:RuntimeQuery):Promise<RuntimeQueryResult<T>>; }
export interface RepositoryRuntimeAdapter<TRecord> { getById(id:string):Promise<TRecord|null>; }
export function parameterizedQuery(text:string, values:unknown[]):RuntimeQuery {
 if(!text.trim()) throw new Error("EMPTY_QUERY");
 return {text,values};
}