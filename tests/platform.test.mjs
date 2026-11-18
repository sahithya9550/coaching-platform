import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../server/index.mjs';
import {scoreAttempt} from '../server/platform.mjs';
import {parseCSV,parsePaperText,validateQuestions,extractPDF} from '../server/question-import.mjs';
import {sampleQuestions} from '../server/sample-questions.mjs';
import {createPlatformStore} from '../server/platform-store.mjs';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
const config={ADMIN_PASSWORD:'A-test-password-only-123',SESSION_SECRET:'b'.repeat(48),DB_PROVIDER:'sqlite',SQLITE_PATH:':memory:'};
async function harness(overrides={}){const app=await createApp({...config,...overrides});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.server.address().port;const call=(path,method='GET',data,cookie)=>fetch(base+'/api/'+path,{method,headers:{'Content-Type':'application/json','X-RIIT-CSRF':'1',Origin:base,...(cookie?{Cookie:cookie}:{})},...(data!==undefined?{body:JSON.stringify(data)}:{})});const reg=async(email='learner@example.com')=>{const r=await call('learning/register','POST',{name:'Test Guardian',email,password:'a-student-password-123',consent:true});assert.equal(r.status,201);return {cookie:r.headers.get('set-cookie').split(';')[0],user:await r.json()}};const admin=async()=>{const r=await call('admin/login','POST',{password:config.ADMIN_PASSWORD});assert.equal(r.status,200);return r.headers.get('set-cookie').split(';')[0]};return {app,call,reg,admin}}
test('student authentication, admin boundary and account ownership',async()=>{const h=await harness();try{assert.equal((await h.call('learning/dashboard')).status,401);assert.equal((await h.call('learning/register','POST',{name:'X'})).status,400);const a=await h.reg();assert.equal((await h.call('admin/learning/overview','GET',undefined,a.cookie)).status,401);assert.equal((await h.call('learning/register','POST',{name:'Guardian',email:'learner@example.com',password:'a-student-password-123',consent:true})).status,409);const wrong=await h.call('learning/login','POST',{email:'learner@example.com',password:'incorrect'});assert.equal(wrong.status,401);const login=await h.call('learning/login','POST',{email:'learner@example.com',password:'a-student-password-123'});assert.equal(login.status,200);assert.ok(!JSON.stringify(await login.json()).includes('hash'));await h.call('learning/logout','POST',{},a.cookie);assert.equal((await h.call('learning/me','GET',undefined,a.cookie)).status,401)}finally{await h.app.close()}});
test('reviewed question import, random tests, answer secrecy, scoring and idempotent submission',async()=>{const h=await harness();try{const admin=await h.admin(),a=await h.reg(),b=await h.reg('second@example.com');assert.equal((await h.call('admin/learning/questions','POST',{questions:sampleQuestions.slice(0,3)},admin)).status,400);assert.equal((await h.call('admin/learning/seed','POST',{},admin)).status,201);assert.equal((await(await h.call('admin/learning/seed','POST',{},admin)).json()).count,0);const start=await h.call('learning/start-test','POST',{exam:'JEE',subject:'All',level:'All',count:5,minutes:10},a.cookie);assert.equal(start.status,201);const {id}=await start.json();assert.equal((await h.call('learning/attempt?id='+id,'GET',undefined,b.cookie)).status,404);let attempt=await(await h.call('learning/attempt?id='+id,'GET',undefined,a.cookie)).json();assert.equal(new Set(attempt.questions.map(q=>q.id)).size,5);assert.equal(attempt.questions.some(q=>'correct'in q||'explanation'in q),false);assert.equal((await h.call('learning/start-test','POST',{exam:'JEE',subject:'All',level:'All',count:2,minutes:5},a.cookie)).status,409);assert.equal((await h.call('learning/answers','PUT',{id,answers:{0:9}},a.cookie)).status,400);const answers={};for(let i=0;i<attempt.questions.length-1;i++){const original=sampleQuestions.find(q=>q.text===attempt.questions[i].text);answers[i]=i===0?(original.correct+1)%4:original.correct}assert.equal((await h.call('learning/answers','PUT',{id,answers},a.cookie)).status,200);const result=await(await h.call('learning/submit-test','POST',{id,answers},a.cookie)).json();assert.equal(result.correct,3);assert.equal(result.wrong,1);assert.equal(result.skipped,1);assert.equal(result.score,11);assert.equal(result.accuracy,75);assert.equal(result.maxScore,20);assert.ok(result.review.every(q=>typeof q.explanation==='string'));const repeat=await(await h.call('learning/submit-test','POST',{id,answers:{}},a.cookie)).json();assert.deepEqual(repeat,result);assert.equal((await h.call('learning/submit-test','POST',{id,answers:{}},b.cookie)).status,404);attempt=await(await h.call('learning/attempt?id='+id,'GET',undefined,a.cookie)).json();assert.equal(attempt.status,'Submitted')}finally{await h.app.close()}});
test('server deadline ignores late answer changes',async()=>{const dir=mkdtempSync(join(tmpdir(),'riit-deadline-')),c={...config,SQLITE_PATH:join(dir,'db.sqlite')};const app=await createApp(c);await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.server.address().port;const call=async(path,method,data,cookie)=>fetch(base+'/api/'+path,{method,headers:{'Content-Type':'application/json',Origin:base,...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(data)});try{const reg=await call('learning/register','POST',{name:'Deadline Guardian',email:'deadline@example.com',password:'a-student-password-123',consent:true});const cookie=reg.headers.get('set-cookie').split(';')[0],u=await reg.json(),db=await createPlatformStore(c);await db.insert({id:'expired-attempt',kind:'attempt',owner:u.id,created_at:new Date().toISOString(),payload:{status:'Active',exam:'JEE',startedAt:new Date(Date.now()-120000).toISOString(),expiresAt:new Date(Date.now()-60000).toISOString(),questions:sampleQuestions.slice(0,2),answers:{0:2}}});const result=await(await call('learning/submit-test','POST',{id:'expired-attempt',answers:{0:0,1:1}},cookie)).json();assert.equal(result.score,4);assert.equal(result.skipped,1);assert.equal(result.timedOut,true);assert.equal(result.elapsedSeconds,60);db.close()}finally{await app.close();rmSync(dir,{recursive:true,force:true})}});
test('free demo, manual bank verification and private Meet scheduling workflow',async()=>{const h=await harness();try{const admin=await h.admin(),a=await h.reg(),b=await h.reg('another@example.com'),request={type:'Demo',subject:'Chemistry',requestedAt:new Date(Date.now()+86400000).toISOString(),message:'Mole concept help',termsAccepted:true};let r=await h.call('learning/bookings','POST',{...request,type:'Paid'},a.cookie);assert.equal(r.status,400);const demo=await(await h.call('learning/bookings','POST',request,a.cookie)).json();assert.equal(demo.amount,0);assert.equal((await h.call('learning/bookings','POST',request,a.cookie)).status,409);let update={id:demo.id,status:'Completed',paymentStatus:'Not required',scheduledAt:new Date(Date.now()+86400000).toISOString(),meetUrl:'https://meet.google.com/abc-defg-hij',note:'See you there'};assert.equal((await h.call('admin/learning/booking','PATCH',{...update,meetUrl:'https://evil.example/'},admin)).status,400);assert.equal((await h.call('admin/learning/booking','PATCH',update,admin)).status,200);r=await h.call('learning/bookings','POST',{...request,type:'Paid'},a.cookie);assert.equal(r.status,409);assert.equal((await h.call('admin/learning/settings','PUT',{upiId:'test@bank',payee:'Test Payee',sessionPrice:1000,paymentInstructions:'Verify manually',terms:'Test terms',contactEmail:'team@example.com'},admin)).status,200);const paid=await(await h.call('learning/bookings','POST',{...request,type:'Paid'},a.cookie)).json();assert.equal(paid.amount,1000);assert.equal(paid.paymentStatus,'Awaiting payment');assert.equal((await h.call('learning/payment','POST',{id:paid.id,reference:'123456789012'},b.cookie)).status,404);assert.equal((await h.call('learning/payment','POST',{id:paid.id,reference:'123456789012'},a.cookie)).status,200);const dashboard=await(await h.call('learning/dashboard','GET',undefined,a.cookie)).json();assert.equal(dashboard.bookings.find(x=>x.id===paid.id).paymentStatus,'Pending verification');update={...update,id:paid.id,status:'Scheduled',paymentStatus:'Pending verification'};assert.equal((await h.call('admin/learning/booking','PATCH',update,admin)).status,400);assert.equal((await h.call('admin/learning/booking','PATCH',{...update,paymentStatus:'Verified'},admin)).status,200);const other=await(await h.call('learning/dashboard','GET',undefined,b.cookie)).json();assert.equal(other.bookings.length,0)}finally{await h.app.close()}});
test('question import validation rejects missing keys and parses quoted CSV and text format',()=>{assert.throws(()=>validateQuestions([{...sampleQuestions[0],correct:9}]));assert.throws(()=>validateQuestions([{...sampleQuestions[0],explanation:''}]));const csv='exam,subject,level,topic,text,A,B,C,D,correct,explanation,source\nJEE,Physics,Easy,Motion,"A question, with comma",one,two,three,four,B,"A \"\"quoted\"\" explanation",Original';assert.equal(validateQuestions(parseCSV(csv))[0].correct,1);const text='Q1. What is 1 + 1?\nA) 1\nB) 2\nC) 3\nD) 4\nAnswer: B\nExplanation: Adding one to one gives two.';assert.equal(parsePaperText(text,{exam:'Foundation',subject:'Mathematics',level:'Easy',topic:'Numbers',source:'Original'})[0].correct,1);assert.throws(()=>parsePaperText('scanned/no answer key',{}));assert.throws(()=>parseCSV('a,b\n"unclosed'))});
test('PDF import extracts actual text and rejects invalid binary',async()=>{
 await assert.rejects(()=>extractPDF(Buffer.from('not a PDF').toString('base64')),/Invalid PDF/);
 const lines=['Q1. What is 1 + 1?','A) 1','B) 2','C) 3','D) 4','Answer: B','Explanation: Adding one and one gives two.'];
 const stream='BT /F1 12 Tf 50 750 Td '+lines.map((line,i)=>(i?'0 -20 Td ':'')+'('+line.replaceAll(')',String.fromCharCode(92)+')')+') Tj').join('\n')+' ET';
 const objs=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>','<< /Length '+Buffer.byteLength(stream)+' >>\nstream\n'+stream+'\nendstream'];
 let pdf='%PDF-1.4\n',offsets=[0];for(let i=0;i<objs.length;i++){offsets.push(Buffer.byteLength(pdf));pdf+=(i+1)+' 0 obj\n'+objs[i]+'\nendobj\n'}const xref=Buffer.byteLength(pdf);pdf+='xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n ').join('\n')+'\ntrailer << /Size 6 /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';
 const text=await extractPDF(Buffer.from(pdf).toString('base64'));assert.ok(text.includes('What is 1 + 1?'));assert.equal(parsePaperText(text,{exam:'Foundation',subject:'Mathematics',level:'Easy',topic:'Numbers',source:'Original'})[0].correct,1);
});
test('scoring handles blank and negative results without fake percentile',()=>{const qs=sampleQuestions.slice(0,3);const r=scoreAttempt({questions:qs},{0:(qs[0].correct+1)%4});assert.equal(r.score,-1);assert.equal(r.accuracy,0);assert.equal(r.skipped,2);assert.equal(r.byTopic.length,3);assert.equal('percentile'in r,false)});
test('password reset revokes existing student sessions',async()=>{const h=await harness();try{const a=await h.reg(),admin=await h.admin();assert.equal((await h.call('admin/learning/reset-password','POST',{id:a.user.id,password:'new-student-password-456'},admin)).status,200);assert.equal((await h.call('learning/me','GET',undefined,a.cookie)).status,401);assert.equal((await h.call('learning/login','POST',{email:'learner@example.com',password:'a-student-password-123'})).status,401);assert.equal((await h.call('learning/login','POST',{email:'learner@example.com',password:'new-student-password-456'})).status,200)}finally{await h.app.close()}});
test('learning data survives SQLite restart',async()=>{const dir=mkdtempSync(join(tmpdir(),'riit-persist-')),c={DB_PROVIDER:'sqlite',SQLITE_PATH:join(dir,'db.sqlite')};try{let db=await createPlatformStore(c);await db.insert({id:'persistent-question',kind:'question',owner:'admin',created_at:new Date().toISOString(),payload:sampleQuestions[0]});db.close();db=await createPlatformStore(c);assert.equal((await db.get('persistent-question')).payload.correct,2);assert.equal((await db.list('question','admin')).length,1);db.close()}finally{rmSync(dir,{recursive:true,force:true})}});

test('Razorpay verifies an owned booking using its saved price and provider status',async t=>{
 const realFetch=globalThis.fetch;
 let link;
 let created=0;
 t.mock.method(globalThis,'fetch',async(url,options)=>{
  if(!String(url).startsWith('https://api.razorpay.com/'))return realFetch(url,options);
  const target=new URL(url);
  assert.ok(options.headers.Authorization.startsWith('Basic '));
  if(options.method==='GET'){
   return Response.json({payment_links:link?.reference_id===target.searchParams.get('reference_id')?[link]:[]});
  }
  created++;
  const order=JSON.parse(options.body);
  assert.equal(order.amount,125000);
  assert.equal(order.accept_partial,false);
  assert.equal(order.currency,'INR');
  link={...order,id:'plink_test1',amount_paid:0,short_url:'https://rzp.io/i/test',status:'created'};
  return Response.json(link);
 });
 const h=await harness({RAZORPAY_MODE:'live',RAZORPAY_KEY_ID:'rzp_live_testfixture',RAZORPAY_KEY_SECRET:'fixture'});
 try{
  const admin=await h.admin(),learner=await h.reg(),other=await h.reg('other@example.test');
  const configBefore=await(await h.call('learning/config')).json();
  assert.equal(configBefore.razorpayEnabled,false);
  const settings={upiId:'',payee:'',sessionPrice:1250,paymentInstructions:'Use checkout',terms:'Lesson policy',contactEmail:'team@example.test'};
  assert.equal((await h.call('admin/learning/settings','PUT',settings,admin)).status,200);
  const request={type:'Demo',subject:'Chemistry',requestedAt:new Date(Date.now()+86400000).toISOString(),message:'',termsAccepted:true};
  const demo=await(await h.call('learning/bookings','POST',request,learner.cookie)).json();
  const schedule={status:'Completed',scheduledAt:request.requestedAt,meetUrl:'https://meet.google.com/abc-defg-hij',note:''};
  assert.equal((await h.call('admin/learning/booking','PATCH',{...schedule,id:demo.id,paymentStatus:'Not required'},admin)).status,200);
  const booking=await(await h.call('learning/bookings','POST',{...request,type:'Paid'},learner.cookie)).json();
  assert.equal(booking.paymentProvider,'razorpay');
  assert.equal((await h.call('admin/learning/settings','PUT',{...settings,sessionPrice:1500},admin)).status,200);
  const checkout=(action,cookie=learner.cookie)=>h.call('learning/razorpay','POST',{id:booking.id,action},cookie);
  assert.equal((await checkout('open',other.cookie)).status,404);
  assert.equal((await(await checkout('open')).json()).url,'https://rzp.io/i/test');
  await checkout('open');
  assert.equal(created,1);
  assert.equal((await h.call('admin/learning/booking','PATCH',{...schedule,id:booking.id,paymentStatus:'Verified'},admin)).status,409);
  assert.equal((await(await checkout('check')).json()).paid,false);
  link={...link,status:'paid',amount_paid:125000,amount:120000};
  assert.equal((await checkout('check')).status,503);
  link.amount=125000;
  assert.equal((await(await checkout('check')).json()).paid,true);
  const dashboard=await(await h.call('learning/dashboard','GET',undefined,learner.cookie)).json();
  assert.equal(dashboard.bookings.find(item=>item.id===booking.id).paymentStatus,'Verified');
 }finally{await h.app.close()}
});

test('an uploaded paper stays out of tests until its reviewed questions are published',async()=>{
 const h=await harness();
 try{
  const admin=await h.admin(),learner=await h.reg();
  const {paper,...question}=sampleQuestions[0];
  const response=await h.call('admin/learning/import-preview','POST',{format:'json',questions:[question],defaults:{paper:'Chemistry Pilot Paper'}},admin);
  assert.equal(response.status,200);
  const {questions}=await response.json();
  assert.equal(questions[0].paper,'Chemistry Pilot Paper');
  const input={exam:'JEE',subject:'All',level:'All',paper:'Chemistry Pilot Paper',count:1,minutes:5};
  assert.equal((await h.call('learning/start-test','POST',input,learner.cookie)).status,400);
  assert.equal((await h.call('admin/learning/questions','POST',{questions,rightsConfirmed:true},admin)).status,201);
  assert.equal((await h.call('learning/start-test','POST',input,learner.cookie)).status,201);
 }finally{await h.app.close()}
});
