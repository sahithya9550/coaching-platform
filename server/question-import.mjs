export function validateQuestions(items){
 if(!Array.isArray(items)||items.length<1||items.length>500)throw Error('Import 1–500 questions at a time.');
 return items.map((q,i)=>{
  if(!q||typeof q!=='object'||Array.isArray(q))throw Error('Question '+(i+1)+': invalid question object');
  const bad=reason=>{throw Error('Question '+(i+1)+': '+reason)};
  const text=(key,max,required=true)=>{const v=String(q[key]??'').trim();if((required&&!v)||v.length>max)bad('invalid '+key);return v};
  const exam=text('exam',12);if(!['JEE','NEET','Foundation'].includes(exam))bad('exam must be JEE, NEET or Foundation');
  const subject=text('subject',30);if(!['Mathematics','Physics','Chemistry','Botany','Zoology'].includes(subject))bad('select a supported subject');
  const level=text('level',12);if(!['Easy','Medium','Hard'].includes(level))bad('level must be Easy, Medium or Hard');
  const options=Array.isArray(q.options)?q.options:[q.A,q.B,q.C,q.D];if(options.length!==4||options.some(o=>typeof o!=='string'||!o.trim()||o.length>2000))bad('four text options are required');
  const correct=typeof q.correct==='string'?['A','B','C','D'].indexOf(q.correct.toUpperCase()):q.correct;if(!Number.isInteger(correct)||correct<0||correct>3)bad('correct must be A, B, C, D or an index 0–3');
  return {exam,subject,level,topic:text('topic',100),text:text('text',6000),options:options.map(s=>s.trim()),correct,explanation:text('explanation',6000),source:text('source',200),year:text('year',4,false),paper:text('paper',150,false),published:true};
 });
}
export function parseCSV(text){
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){row.push(cell);cell=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell=''}else cell+=c}
 if(quoted)throw Error('CSV has an unclosed quote.');row.push(cell);if(row.some(Boolean))rows.push(row);if(rows.length<2)throw Error('CSV needs headers and at least one row.');const headers=rows.shift().map(s=>s.replace(/^\uFEFF/,'').trim());return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??''])));
}
export function parsePaperText(text,defaults){
 // A deliberate import grammar: never guess answer keys or silently invent questions.
 const blocks=text.split(/(?:^|\n)\s*Q\d+[.)]\s*/).slice(1);const items=[];
 for(const block of blocks){const m=block.match(/^([\s\S]*?)\s+A[).]\s*([\s\S]*?)\s+B[).]\s*([\s\S]*?)\s+C[).]\s*([\s\S]*?)\s+D[).]\s*([\s\S]*?)\s+Answer:\s*([ABCD])\s+Explanation:\s*([\s\S]*)$/i);if(m)items.push({...defaults,text:m[1].trim(),options:m.slice(2,6).map(s=>s.trim()),correct:m[6].toUpperCase(),explanation:m[7].trim()})}
 if(items.length!==blocks.length||!items.length)throw Error('Some questions could not be read completely. Use Q1. … A) … B) … C) … D) … Answer: A Explanation: …, or import the CSV/JSON template. Scanned PDFs need transcription first.');return validateQuestions(items);
}
export async function extractPDF(base64){if(typeof base64!=='string'||base64.length>7_000_000||!/^[A-Za-z0-9+/=\r\n]+$/.test(base64))throw Error('Use a text PDF smaller than 5 MB.');const bytes=Buffer.from(base64,'base64');if(bytes.subarray(0,5).toString()!=='%PDF-')throw Error('Invalid PDF file.');const {getDocument}=await import('pdfjs-dist/legacy/build/pdf.mjs');const task=getDocument({data:new Uint8Array(bytes),isEvalSupported:false,useSystemFonts:true,disableFontFace:true});const pdf=await task.promise;try{if(pdf.numPages>100)throw Error('Import up to 100 PDF pages at a time.');let text='';for(let n=1;n<=pdf.numPages;n++){const page=await pdf.getPage(n),content=await page.getTextContent();text+=content.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join('')+'\n';if(text.length>1_000_000)throw Error('PDF text is too large.')}return text}finally{await pdf.destroy()}}
