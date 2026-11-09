import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../server/index.mjs';
import {createStore} from '../server/store.mjs';
const config={ADMIN_PASSWORD:'A-test-password-only-123',SESSION_SECRET:'a'.repeat(48),DB_PROVIDER:'sqlite',SQLITE_PATH:':memory:'};
test('full enquiry and authenticated owner workflow',async()=>{
 const app=await createApp(config);await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.server.address().port;
 const call=(path,method='GET',data,cookie,origin=base)=>fetch(base+path,{method,headers:{'Content-Type':'application/json','X-RIIT-CSRF':'1',...(method!=='GET'?{Origin:origin}:{}),...(cookie?{Cookie:cookie}:{})},...(data?{body:JSON.stringify(data)}:{})});
 try{
 assert.equal((await call('/api/admin/enquiries')).status,401);
 assert.equal((await call('/api/admin/export')).status,401);
 assert.equal((await call('/.env')).status,404);
 assert.equal((await call('/api/enquiries','POST',{parentName:'invalid'})).status,400);
 const data={parentName:'Test Parent',email:'test@example.com',phone:'9000000000',studentClass:'11',exam:'JEE',subject:'Chemistry',mode:'One-to-one',consent:true,website:''};
 assert.equal((await call('/api/enquiries','POST',data,null,'https://other.example')).status,403);
 const created=await call('/api/enquiries','POST',data);assert.equal(created.status,201);assert.match((await created.json()).reference,/^[0-9A-F]{8}$/);
 assert.equal((await call('/api/admin/login','POST',{password:'wrong'})).status,401);
 const login=await call('/api/admin/login','POST',{password:config.ADMIN_PASSWORD});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];
 let entries=await(await call('/api/admin/enquiries','GET',null,cookie)).json();assert.equal(entries.length,1);assert.equal(entries[0].parentName,data.parentName);
 assert.equal((await call('/api/admin/enquiries','PATCH',{id:entries[0].id,status:'Contacted',notes:'=formula'},cookie)).status,200);
 entries=await(await call('/api/admin/enquiries','GET',null,cookie)).json();assert.equal(entries[0].status,'Contacted');
 const csv=await(await call('/api/admin/export','GET',null,cookie)).text();assert.ok(csv.includes("'=formula"));assert.ok(csv.includes('Test Parent'));
 await call('/api/admin/logout','POST',null,cookie);assert.equal((await call('/api/admin/enquiries','GET',null,cookie)).status,401);
 }finally{await app.close()}
});
test('SQLite enquiries survive a server restart',async()=>{const dir=mkdtempSync(join(tmpdir(),'riit-test-')),c={DB_PROVIDER:'sqlite',SQLITE_PATH:join(dir,'db.sqlite')};try{let db=await createStore(c);await db.add({id:'test',createdAt:new Date().toISOString(),parentName:'Persistent',status:'New',notes:''});db.close();db=await createStore(c);assert.equal((await db.list())[0].parentName,'Persistent');db.close()}finally{rmSync(dir,{recursive:true,force:true})}});
test('host configuration fails safely without durable storage or admin credentials',async()=>{await assert.rejects(()=>createApp({}),/setup/);await assert.rejects(()=>createStore({RENDER:'true',DB_PROVIDER:'sqlite'}),/temporary/);await assert.rejects(()=>createStore({DB_PROVIDER:'supabase'}),/SUPABASE_URL/)});
test('modern Supabase secret keys stay in server-side apikey headers',async()=>{
 const http=await import('node:http');let seen;
 const backend=http.createServer(async(req,res)=>{seen=req.headers;res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify([{id:'test',created_at:'2026-11-09T00:00:00Z',payload:{parentName:'Adapter test'},status:'New',notes:''}]))});
 await new Promise(r=>backend.listen(0,'127.0.0.1',r));
 try{const db=await createStore({DB_PROVIDER:'supabase',SUPABASE_URL:'http://127.0.0.1:'+backend.address().port,SUPABASE_SECRET_KEY:'sb_secret_test_only'});assert.equal((await db.list())[0].parentName,'Adapter test');assert.equal(seen.apikey,'sb_secret_test_only');assert.equal(seen.authorization,undefined)}finally{await new Promise(r=>backend.close(r))}
});
