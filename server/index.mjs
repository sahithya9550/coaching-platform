import http from 'node:http';
import {isIP} from 'node:net';
import {createReadStream,existsSync,statSync} from 'node:fs';
import {resolve,sep,extname} from 'node:path';
import {randomBytes,randomUUID,scryptSync,timingSafeEqual,createHmac} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createStore} from './store.mjs';
import {createPlatform} from './platform.mjs';
const stages=['New','Contacted','Demo scheduled','Enrolled','Closed'];
export function hashPassword(password,salt=randomBytes(16).toString('hex')){return salt+':'+scryptSync(password,salt,64).toString('hex')}
function verifyPassword(password,hash){try{const [salt,key]=hash.split(':'),expected=Buffer.from(key,'hex'),actual=scryptSync(password,salt,64);return expected.length===64&&timingSafeEqual(expected,actual)}catch{return false}}
function validate(data){if(!data||typeof data!=='object')return null;const out={};for(const [field,max]of Object.entries({parentName:100,email:150,phone:15,studentClass:2,exam:12,subject:20,mode:20})){if(typeof data[field]!=='string')return null;out[field]=data[field].trim();if(out[field].length>max)return null}if(out.parentName.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email)||!/^(?:\+91[ -]?)?[6-9]\d{9}$/.test(out.phone)||!['9','10','11','12'].includes(out.studentClass)||!['JEE','NEET','Foundation'].includes(out.exam)||!['Mathematics','Physics','Chemistry','Botany','Zoology','Help me choose'].includes(out.subject)||!['One-to-one','Small group'].includes(out.mode)||data.consent!==true||data.website!=='')return null;return out}
export async function createApp(config=process.env){
 const passwordHash=config.ADMIN_PASSWORD_HASH||(config.ADMIN_PASSWORD?.length>=12?hashPassword(config.ADMIN_PASSWORD):null),secret=config.SESSION_SECRET;
 if(!passwordHash||!secret||secret.length<32)throw Error('Run npm run setup, or set ADMIN_PASSWORD (12+ characters) and SESSION_SECRET (32+ characters).');
 const store=await createStore(config),platform=await createPlatform(config),root=resolve(config.STATIC_DIR||'dist'),attempts=new Map(),sessions=new Map();
 const secure=config.NODE_ENV==='production';
 function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data))}
 function sameOrigin(req){try{return !req.headers.origin||new URL(req.headers.origin).host===req.headers.host}catch{return false}}
 function sign(s){return createHmac('sha256',secret).update(s).digest('hex')}
 function validSession(req){const match=/(?:^|;\s*)riit_session=([^;]+)/.exec(req.headers.cookie||'');if(!match)return false;const [id,sig]=match[1].split('.');const expected=sign(id);if(!sig||sig.length!==expected.length||!timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return false;const expiry=sessions.get(id);if(!expiry||expiry<Date.now()){sessions.delete(id);return false}return true}
 function cookie(value,maxAge){return `riit_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure?'; Secure':''}`}
 async function body(req){let data='';for await(const chunk of req){data+=chunk;if(Buffer.byteLength(data)>(req.url.startsWith('/api/admin/learning/import-preview')?8_000_000:req.url.startsWith('/api/admin/learning/questions')?8_000_000:16384))throw Object.assign(Error('Request too large.'),{status:413})}try{return JSON.parse(data)}catch{throw Object.assign(Error('Invalid JSON.'),{status:400})}}
 function throttle(key,max){const now=Date.now();if(attempts.size>10000)for(const[k,v]of attempts)if(now>v.until)attempts.delete(k);let row=attempts.get(key);if(!row||row.until<now)row={count:0,until:now+15*60000};row.count++;attempts.set(key,row);return row.count>max}
 const server=http.createServer(async(req,res)=>{
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','DENY');
  try{const forwarded=String(req.headers['x-forwarded-for']||'').split(',').at(-1)?.trim();req.riitIP=config.RENDER&&isIP(forwarded||'')?forwarded:req.socket.remoteAddress;const url=new URL(req.url,'http://localhost'),path=url.pathname,method=req.method;
   if(path==='/api/health')return json(res,200,{ok:true});
   if(path.startsWith('/api/')&&!['GET','HEAD'].includes(method)&&!sameOrigin(req))return json(res,403,{error:'Please submit from this website.'});
   if(path==='/api/enquiries'&&method==='POST'){
    if(throttle('form:'+req.riitIP,30))return json(res,429,{error:'Too many requests. Please try later.'});
    const data=validate(await body(req));if(!data)return json(res,400,{error:'Check all fields, your Indian mobile number, and adult/guardian consent.'});
    const id=randomUUID();await store.add({...data,id,createdAt:new Date().toISOString(),status:'New',notes:'',consentVersion:'demo-enquiry-v1'});return json(res,201,{ok:true,reference:id.slice(0,8).toUpperCase()});
   }
   if(path==='/api/admin/login'&&method==='POST'){
    if(req.headers['x-riit-csrf']!=='1')return json(res,403,{error:'Invalid request.'});
    if(throttle('login:'+req.riitIP,10))return json(res,429,{error:'Too many sign-in attempts. Try in 15 minutes.'});
    const data=await body(req);if(typeof data.password!=='string'||data.password.length>1024||!verifyPassword(data.password,passwordHash))return json(res,401,{error:'Incorrect admin password.'});
    for(const[id,expiry]of sessions)if(expiry<Date.now())sessions.delete(id);
    const id=randomBytes(32).toString('hex');sessions.set(id,Date.now()+8*3600000);res.setHeader('Set-Cookie',cookie(id+'.'+sign(id),8*3600));return json(res,200,{ok:true});
   }
   if(path.startsWith('/api/admin/')){
    if(!validSession(req))return json(res,401,{error:'Admin sign-in required.'});
    if(method!=='GET'&&req.headers['x-riit-csrf']!=='1')return json(res,403,{error:'Invalid request.'});
    if(await platform.handle({req,res,path,method,json,body,throttle,isAdmin:true}))return;
    if(path==='/api/admin/logout'&&method==='POST'){const match=/riit_session=([^.]+)/.exec(req.headers.cookie||'');if(match)sessions.delete(match[1]);res.setHeader('Set-Cookie',cookie('',0));return json(res,200,{ok:true})}
    if(path==='/api/admin/enquiries'&&method==='GET')return json(res,200,await store.list());
    if(path==='/api/admin/enquiries'&&method==='PATCH'){const data=await body(req);if(typeof data.id!=='string'||!/^[a-f0-9-]{36}$/i.test(data.id)||!stages.includes(data.status)||typeof data.notes!=='string'||data.notes.length>3000)return json(res,400,{error:'Invalid update.'});const updated=await store.update(data.id,data.status,data.notes);return json(res,updated?200:404,{ok:updated});}
    if(path==='/api/admin/export'&&method==='GET'){let rows=[];for(let offset=0;offset<10000;offset+=1000){const page=await store.list(1000,offset);rows.push(...page);if(page.length<1000)break}const cell=value=>{let s=String(value??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};const columns=['Reference','Created UTC','Adult contact','Email','Phone','Class','Exam','Subject','Format','Status','Notes'];const csv=[columns,...rows.map(r=>[r.id.slice(0,8).toUpperCase(),r.createdAt,r.parentName,r.email,r.phone,r.studentClass,r.exam,r.subject,r.mode,r.status,r.notes])].map(row=>row.map(cell).join(',')).join('\r\n');res.writeHead(200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="RIIT-enquiries.csv"','Cache-Control':'no-store'});return res.end('\uFEFF'+csv)}
   }
   if(await platform.handle({req,res,path,method,json,body,throttle}))return;
   if(path.startsWith('/api/'))return json(res,404,{error:'Not found.'});
   if(method!=='GET'&&method!=='HEAD')return json(res,405,{error:'Method not allowed.'});
   const relative=decodeURIComponent(path).replace(/^\/+/,''),candidate=resolve(root,relative);
   if(candidate!==root&&!candidate.startsWith(root+sep))return json(res,403,{error:'Forbidden.'});
   let file=candidate;if(!existsSync(file)||!statSync(file).isFile()){if(path==='/'||path==='/admin'||path==='/admin/'||path==='/learn'||path==='/learn/')file=resolve(root,'index.html');else return json(res,404,{error:'Not found.'})}
   if(!existsSync(file))return json(res,503,{error:'Run npm run build first.'});
   const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'};
   res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':extname(file)==='.html'?'no-cache':'public, max-age=3600'});if(method==='HEAD')return res.end();createReadStream(file).pipe(res);
  }catch(e){if(!res.headersSent)json(res,e.status||503,{error:e.status?e.message:'Unable to complete this request. Please try again.'});else res.end()}
 });
 return {server,store,close:()=>new Promise(resolve=>server.close(()=>{store.close();platform.close();resolve()}))};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const app=await createApp();const portArg=process.argv.indexOf('--port');const port=Number(portArg>=0?process.argv[portArg+1]:process.env.PORT||3000);app.server.listen(port,'0.0.0.0',()=>console.log('R-IIT Bharat Mentors running on port '+port));for(const signal of ['SIGTERM','SIGINT'])process.on(signal,async()=>{await app.close();process.exit(0)})}catch(e){console.error(e.message);process.exit(1)}
}
