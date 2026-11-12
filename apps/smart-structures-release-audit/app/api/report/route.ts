import { readState, apiError } from "@/lib/audit-server";
import { STATUS, SNAPSHOT, HEAD, BASELINE_HASH, CRITERIA, pagePassed, type AuditState } from "@/lib/audit-model";
export const dynamic="force-dynamic";
const escape=(v:unknown)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
function csvCell(v:unknown){let s=String(v??"");if(/^(?:[\t\r\n]|\s*[=+@\-])/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
function reportHtml(s:AuditState,generated:string,digest:string,runId?:string){
 const run=s.runs.find(r=>r.id===runId)||s.runs.at(-1);
 const row=(cells:unknown[])=>"<tr>"+cells.map(v=>`<td>${escape(v)}</td>`).join("")+"</tr>";
 const table=(headers:string[],rows:string[])=>`<table><thead><tr>${headers.map(v=>`<th>${escape(v)}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table>`;
 return `<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><title>گزارش ممیزی سازه‌های هوشمند — NO-GO</title><style>@font-face{font-family:Audit;src:url('/fonts/NotoSansArabic-Regular.ttf')}body{font-family:Audit,Tahoma,sans-serif;line-height:1.9;color:#192a3c;background:#fff;margin:40px;max-width:1600px}h1{font-size:28px}h2{margin-top:40px}table{width:100%;border-collapse:collapse;font-size:11px;margin:20px 0}td,th{padding:10px;border:1px solid #d9e1e5;text-align:right;vertical-align:top;overflow-wrap:anywhere;white-space:pre-wrap}th{background:#eef2f4}p,pre{overflow-wrap:anywhere;white-space:pre-wrap}.decision{background:#fff0ef;border:1px solid #e5b3ad;padding:20px;border-radius:12px;color:#a1342a}.mono{direction:ltr;font-family:monospace;font-size:11px}button{background:#163c39;color:white;border:0;padding:12px 20px;cursor:pointer} @media print{body{margin:0;font-size:10px}button{display:none}table{font-size:8px}tr{break-inside:avoid}thead{display:table-header-group}@page{size:A4 landscape;margin:14mm}}</style><body>
 <h1>گزارش ممیزی انتشار کتاب «سازه‌های هوشمند»</h1><p>نسخهٔ هدف: v1.0.1 · مخزن y0bahrambeigi/bhb · PR #82</p>
 <div class="decision"><b>تصمیم ثبت‌شده: NO-GO — انتشار مجاز نیست</b><p>این فایل گزارش وضعیت ممیزی است؛ حتی با تکمیل فرم‌ها مجوز انتشار صادر نمی‌شود. ارسال ایمیل، merge، ایجاد tag/release و انتشار Figshare از این سامانه انجام نمی‌شود. v1.0.0 و Figshare v2 باید دست‌نخورده بمانند.</p></div>
 <p>زمان تولید: ${escape(generated)}\nزمان دریافت snapshot مخزن: ${escape(SNAPSHOT.retrievedAt)}\nگیت‌های اولیه از مدارک مخزن استخراج شده‌اند؛ آزمایش فونت و بررسی بایت فایل‌های کتاب در ساخت داشبورد تکرار نشده است.</p><p class="mono">PR head: ${HEAD}<br>Dataset SHA-256: ${digest}</p>
 <h2>ماتریس گیت‌ها</h2>${table(["گیت","وضعیت","مدرک لازم","معیار توقف","مسئول اقدام","لینک مدرک / ثبت مبنا","آخرین به‌روزرسانی","یادداشت"],s.gates.map(g=>row([g.id+" · "+g.title,STATUS[g.status],g.required,g.stop,g.owner,g.url,g.updatedAt,g.note])))}
 <h2>دفتر شواهد</h2>${table(["شناسه","گیت","عنوان / نوع","یادداشت","لینک / ضمیمه","SHA-256","ثبت‌کننده / زمان"],s.evidence.map(e=>row([e.id,e.gate,e.title+" / "+e.kind,e.note,[e.url,e.fileName,e.fileId?"/api/evidence?id="+e.fileId:""].filter(Boolean).join("\n"),e.sha256||"—",e.reviewer+"\n"+e.createdAt])))}
 <h2>QA بصری ۴۰ صفحه</h2><p>${run?escape(`${run.title}\nPDF SHA-256: ${run.pdfHash}\nCommit: ${run.commit}\nRenderer: ${run.renderer}`):"رندر مرجع ثبت نشده است؛ هر ۴۰ صفحه بررسی‌نشده‌اند."}</p>
 ${table(["صفحه",...CRITERIA.map(c=>c[1]),"نتیجه","بازبین / زمان / مدرک / شرح"],Array.from({length:40},(_,i)=>{const r=s.reviews.find(r=>r.runId===run?.id&&r.page===i+1);return row([i+1,...CRITERIA.map(([key])=>r?({pass:"تأیید",fail:"مردود",pending:"بررسی‌نشده"}[r.checks[key]]||"بررسی‌نشده"):"بررسی‌نشده"),r?(pagePassed(r)?"تأیید":"ناقص / ایراد"):"بررسی‌نشده",r?`${r.reviewer}\n${r.updatedAt}\n${r.evidenceUrl}\n${r.note}`:"—"])}))}
 <h2>مقایسه و حفاظت نسخه‌ها</h2><p>نسخهٔ پایه v1.0.0 / Figshare v2 محافظت‌شده است. v1.0.1 کاندید و منتشرنشده است. هش DOCX پایه طبق مدرک مخزن: <span class="mono">${BASELINE_HASH}</span>. SHA256SUMS تاریخی به rc1 تعلق دارد. مقایسهٔ هش فقط یکسانی بایت‌ها را بررسی می‌کند و تأیید بصری یا عدم تغییر همهٔ فایل‌های بیرونی نیست.</p>
 ${table(["فایل پایه","فایل هدف","هش پایه","هش هدف","نتیجه","یادداشت / زمان"],s.comparisons.map(c=>row([c.baselineName,c.candidateName,c.baselineHash,c.candidateHash,c.baselineHash===c.candidateHash?"یکسان":"متفاوت",c.note+"\n"+c.createdAt])))}
 <h2>تاریخچهٔ کامل تغییرات</h2>${table(["ردیف","شناسه","نوع / موضوع","عامل ثبت","زمان","دادهٔ ثبت‌شده"],s.events.map(e=>row([e.seq,e.id,e.kind+" / "+e.entity,e.actor,e.createdAt,JSON.stringify(e.payload,null,2)])))}
 <h2>ترتیب مراحل بعدی</h2><p>مجوز کتبی و احراز چهره‌ها ← رندر پایدار ← QA کامل ← هش نهایی ← metadata و حفاظت نسخهٔ پایه ← بازبینی/merge ← tag/release ← Figshare v3 و تطبیق نهایی metadata. مراحل خارجی صرفاً برای برنامه‌ریزی نمایش داده می‌شوند.</p>
 <p>برای آرشیو ماشینی و همهٔ رندرها و تغییرات، خروجی JSON را نیز دریافت کنید. هیچ دادهٔ غایب به‌عنوان تأیید تلقی نشده است.</p></body></html>`;
}
export async function GET(request:Request){
 try{
  const s=await readState();if(!s.authenticated)throw new Error("AUTH_REQUIRED");
  const params=new URL(request.url).searchParams,format=params.get("format")||"html";
  const generatedAt=new Date().toISOString();
  const dataset={schemaVersion:1,generatedAt,sourceSnapshot:SNAPSHOT,...s};
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(JSON.stringify(dataset))))).map(x=>x.toString(16).padStart(2,"0")).join("");
  let body:string,ext:string,type:string;
  if(format==="json"){body=JSON.stringify({dataset,sha256:digest,hashEncoding:"SHA-256 of UTF-8 JSON.stringify(dataset)"},null,2);ext="json";type="application/json";}
  else if(format==="csv"){body="\uFEFF"+[["گیت","عنوان","وضعیت","مدرک لازم","معیار توقف","مسئول اقدام","لینک مدرک","آخرین به‌روزرسانی","یادداشت","تصمیم"],...s.gates.map(g=>[g.id,g.title,STATUS[g.status],g.required,g.stop,g.owner,g.url,g.updatedAt,g.note,"NO-GO"])].map(row=>row.map(csvCell).join(",")).join("\r\n");ext="csv";type="text/csv";}
  else{body=reportHtml(s,generatedAt,digest,params.get("run")||undefined);ext="html";type="text/html";}
  const inline=params.get("view")==="1";
  return new Response(body,{headers:{"Content-Type":type+"; charset=utf-8","Content-Disposition":`${inline?"inline":"attachment"}; filename="Smart_Structures_Audit_NO-GO.${ext}"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; font-src 'self'; img-src 'none'; frame-ancestors 'self'"}});
 }catch(e){return apiError(e);}
}
