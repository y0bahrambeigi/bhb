import { z } from "zod";
import { appendEvent, apiError, checkOrigin, mutationResponse, readState } from "@/lib/audit-server";
import { CRITERIA, pagePassed } from "@/lib/audit-model";

export const dynamic="force-dynamic";
const str=(max=2000)=>z.string().trim().max(max);
const hash=z.string().regex(/^[a-f0-9]{64}$/i,"SHA-256 باید ۶۴ رقم هگزادسیمال باشد.").transform(s=>s.toLowerCase());
const url=str().refine(s=>!s||/^https?:\/\//i.test(s),"لینک باید با https:// یا http:// آغاز شود.");
const gateSchema=z.object({id:z.string(),status:z.enum(["blocked","pending","review","documented","verified"]),owner:str(160).min(2),note:str(6000).min(8),reviewer:str(160).min(2),evidenceId:str(100),revision:str(100),runId:str(100).optional()});
const runSchema=z.object({title:str(160).min(3),pdfHash:hash,commit:z.string().regex(/^[a-f0-9]{40}$/i,"commit باید SHA کامل ۴۰ رقمی باشد."),renderer:str(300).min(5),reviewer:str(160).min(2)});
const reviewSchema=z.object({runId:str(100),page:z.number().int().min(1).max(40),checks:z.record(z.enum(["pass","fail","pending"])),note:str(6000),reviewer:str(160).min(2),evidenceUrl:url,revision:str(100)});
const comparisonSchema=z.object({baselineName:str(300).min(1),candidateName:str(300).min(1),baselineHash:hash,candidateHash:hash,baselineSize:z.number().int().nonnegative(),candidateSize:z.number().int().nonnegative(),note:str(6000)});

export async function GET(){try{return Response.json(await readState(),{headers:{"Cache-Control":"no-store"}});}catch(e){return apiError(e);}}
export async function POST(request:Request){
 try{
  checkOrigin(request);
  if(Number(request.headers.get("content-length")||0)>100_000)throw new Error("درخواست بیش از حد بزرگ است.");
  const {action,data}=z.object({action:z.string(),data:z.unknown()}).parse(await request.json());
  const state=await readState();
  if(!state.authenticated)throw new Error("AUTH_REQUIRED");
  if(action==="gate"){
   const p=gateSchema.parse(data),gate=state.gates.find(g=>g.id===p.id);
   if(!gate)throw new Error("گیت نامعتبر است.");
   if(gate.external)throw new Error("این مرحله قفل است؛ فقط می‌توانید مدرک به دفتر شواهد اضافه کنید.");
   if(p.status==="verified"){
    const evidence=state.evidence.find(e=>e.id===p.evidenceId&&e.gate===p.id&&e.kind!=="draft");
    if(!evidence || (!evidence.url&&!evidence.fileId))throw new Error("تأیید به مدرک قابل مشاهدهٔ همین گیت نیاز دارد؛ پیش‌نویس مجوز معتبر نیست.");
    if(gate.deps.some(id=>state.gates.find(g=>g.id===id)?.status!=="verified"))throw new Error("ابتدا پیش‌نیازهای این گیت باید تأیید ممیز بگیرند.");
    if(p.id==="G03"){
     const run=state.runs.find(r=>r.id===p.runId);
     if(!run)throw new Error("ابتدا رندر مرجع با هش PDF، commit و نسخهٔ ابزار را در بخش QA ثبت و انتخاب کنید.");
     if(/\balpha\b|\bbeta\b|preview|nightly/i.test(run.renderer))throw new Error("رندر آزمایشی برای تأیید نهایی معتبر نیست؛ محیط پایدار لازم است.");
    }
    if(p.id==="G04"){
     const run=state.runs.find(r=>r.id===p.runId);
     if(p.runId!==state.gates.find(g=>g.id==="G03")?.runId)throw new Error("QA باید دقیقاً متعلق به رندر تأییدشده در G03 باشد.");
     if(!run || Array.from({length:40},(_,i)=>state.reviews.find(r=>r.runId===run.id&&r.page===i+1)).some(r=>!r||!pagePassed(r)))throw new Error("تمام ۴۰ صفحهٔ یک رندر مشخص باید با هشت معیار تأیید شده باشند.");
    }
   }
   const {revision,id,...payload}=p;
   const chosen=state.evidence.find(e=>e.id===p.evidenceId&&e.gate===p.id&&e.kind!=="draft");
   if(p.evidenceId && !chosen)throw new Error("مدرک انتخاب‌شده برای این گیت معتبر نیست.");
   const evidenceUrl=chosen?.url || (chosen?.fileId?`/api/evidence?id=${chosen.fileId}`:"");
   const checkedSequence=p.status==="verified"?(state.events.at(-1)?.seq ?? 0):undefined;
   await appendEvent("gate",id,{...payload,url:evidenceUrl},revision,undefined,checkedSequence);
  }else if(action==="qa-run"){
   const p=runSchema.parse(data);await appendEvent("qa-run",crypto.randomUUID(),p);
  }else if(action==="qa-page"){
   const p=reviewSchema.parse(data);
   if(!state.runs.some(r=>r.id===p.runId))throw new Error("ابتدا رندر مرجع را ثبت کنید.");
   if(CRITERIA.some(([key])=>!p.checks[key])||Object.keys(p.checks).length!==CRITERIA.length)throw new Error("وضعیت هر هشت معیار الزامی است.");
   if(Object.values(p.checks).includes("fail")&&p.note.length<8)throw new Error("برای معیار مردود، شرح ایراد لازم است.");
   const {revision,...payload}=p;await appendEvent("qa-page",`${p.runId}:${p.page}`,payload,revision);
  }else if(action==="comparison"){
   const p=comparisonSchema.parse(data);await appendEvent("comparison",crypto.randomUUID(),p);
  }else throw new Error("عملیات پشتیبانی نمی‌شود؛ ارسال ایمیل و انتشار خارجی در این سامانه وجود ندارد.");
  return mutationResponse();
 }catch(e){return apiError(e);}
}
