import {mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
export async function createStore(config=process.env){
 const provider=config.DB_PROVIDER||'sqlite';
 if(provider==='supabase'){
  const apiKey=config.SUPABASE_SECRET_KEY||config.SUPABASE_SERVICE_ROLE_KEY;
  if(!config.SUPABASE_URL||!apiKey)throw Error('Configure SUPABASE_URL and SUPABASE_SECRET_KEY for hosted storage.');
  const base=config.SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/riit_enquiries';
  const headers={apikey:apiKey,...(!apiKey.startsWith('sb_secret_')?{Authorization:'Bearer '+apiKey}:{}),'Content-Type':'application/json'};
  async function request(query='',options={}){const r=await fetch(base+query,{...options,headers:{...headers,...options.headers},signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('Database request failed ('+r.status+'). Check database setup or free-plan project status.');return r.status===204?null:r.json()}
  return {async add(entry){const {id,createdAt,status,notes,...payload}=entry;await request('',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({id,created_at:createdAt,payload,status,notes})});},async list(limit=1000,offset=0){const rows=await request('?select=*&order=created_at.desc&limit='+limit+'&offset='+offset);return rows.map(r=>({...r.payload,id:r.id,createdAt:r.created_at,status:r.status,notes:r.notes}))},async update(id,status,notes){const rows=await request('?id=eq.'+encodeURIComponent(id),{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({status,notes})});return rows.length>0},close(){}};
 }
 if(provider!=='sqlite')throw Error('DB_PROVIDER must be sqlite or supabase.');
 if(config.RENDER)throw Error('Render free disks are temporary. Set DB_PROVIDER=supabase before deployment.');
 const {DatabaseSync}=await import('node:sqlite');
 const location=config.SQLITE_PATH||resolve('data/enquiries.sqlite');if(location!==':memory:')mkdirSync(dirname(location),{recursive:true});
 const db=new DatabaseSync(location);db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS enquiries(id TEXT PRIMARY KEY, created_at TEXT NOT NULL, payload TEXT NOT NULL, status TEXT NOT NULL, notes TEXT NOT NULL);');
 return {async add(entry){const{id,createdAt,status,notes,...payload}=entry;db.prepare('INSERT INTO enquiries VALUES(?,?,?,?,?)').run(id,createdAt,JSON.stringify(payload),status,notes)},async list(limit=1000,offset=0){return db.prepare('SELECT * FROM enquiries ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit,offset).map(r=>({...JSON.parse(r.payload),id:r.id,createdAt:r.created_at,status:r.status,notes:r.notes}))},async update(id,status,notes){return db.prepare('UPDATE enquiries SET status=?,notes=? WHERE id=?').run(status,notes,id).changes>0},close(){db.close()}};
}
