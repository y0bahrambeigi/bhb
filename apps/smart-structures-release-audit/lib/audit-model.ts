import snapshot from "@/data/repository-snapshot.json";

export const SNAPSHOT = snapshot;
export const HEAD = snapshot.pull_request.head_sha;
export const PR_URL = snapshot.pull_request.url;
export const INTAKE_URL = snapshot.files[0].display_url + "#verification-on-2026-11-06";
export const BASELINE_HASH = "2111389b572b4d71175faaac42d6ace1f0394f60871ccb127ee0fdb0027301c2";
export const STATUS = { blocked:"متوقف", pending:"در انتظار", review:"نیازمند بررسی", documented:"مدرک موجود", verified:"تأیید ممیز", locked:"قفل وابستگی" } as const;
export type GateStatus = keyof typeof STATUS;
export type Gate = { id:string; title:string; subtitle:string; status:GateStatus; required:string; stop:string; owner:string; url:string; updatedAt:string; note:string; deps:string[]; external?:boolean; revision:string;runId?:string;evidenceId?:string;reviewer?:string };
const date = "2026-11-06";
const repoFile = (p:string) => `https://github.com/y0bahrambeigi/bhb/blob/${HEAD}/publications/smart-structures/${p}`;
export const SEED_GATES: Gate[] = [
  {id:"G01",title:"مجوز کتبی فونت",subtitle:"استفاده و embedding در PDF / DOCX",status:"blocked",required:"پاسخ کتبی صاحب حقوق با دامنهٔ مجاز استفاده، embedding، توزیع PDF و DOCX و نسخهٔ فونت؛ ثبت نامه و تاریخ.",stop:"نبود اجازهٔ صریح یا اتکا به fsType=0 و لینک دانلود رایگان.",owner:"صاحب اثر / پیگیری مجوز",url:INTAKE_URL,updatedAt:date,note:"بستهٔ رسمی و metadata فونت فاقد متن مجوز عمومی هستند. پیش‌نویس ایمیل مدرک اخذ مجوز نیست.",deps:[],revision:"seed"},
  {id:"G02",title:"احراز Bold مستقل",subtitle:"B Nazanin Regular & Bold · 2.01",status:"documented",required:"هویت فایل‌های مستقل Regular و Bold، SHA-256، weight 400/700 و خروجی Fontconfig.",stop:"Bold مصنوعی یا resolve شدن Bold به Regular؛ عدم تطابق هش فونت‌های رندر.",owner:"مسئول تایپوگرافی",url:INTAKE_URL,updatedAt:date,note:"در سند ۶ نوامبر مخزن، هر دو چهرهٔ رسمی مستقل احراز شده‌اند؛ این داشبورد آزمایش فونت را تکرار نکرده است.",deps:[],revision:"seed"},
  {id:"G03",title:"رندر نهایی با فونت واقعی",subtitle:"ابزار پایدار + DOCX و PDF منجمد",status:"review",required:"رندر با ابزار تولید پایدار، نسخهٔ محیط، commit، هش فایل‌ها، pdffonts و بررسی fallback در متن، جدول و سربرگ.",stop:"رندر آزمایشی/alpha، جایگزینی فونت یا غیبت یکی از فایل‌های نهایی.",owner:"مسئول آماده‌سازی کتاب",url:INTAKE_URL,updatedAt:date,note:"رندر داخلی LibreOffice 26.8 alpha دارای ۴۰ صفحه و subset هر دو فونت بوده؛ رندر پایدار هنوز مدرک ندارد.",deps:["G01","G02"],revision:"seed"},
  {id:"G04",title:"QA بصری هر ۴۰ صفحه",subtitle:"بازبینی در اندازهٔ کامل، صفحه به صفحه",status:"pending",required:"۴۰ فرم امضاشده برای PDF با هش یکسان؛ RTL، معادلات، جداول تو‌در‌تو، شکل‌ها، زیرنویس، سربرگ و شکست صفحه.",stop:"حتی یک صفحهٔ بررسی‌نشده، معیار مردود یا QA متعلق به هش PDF دیگری.",owner:"بازبین مستقل / ویراستار",url:PR_URL,updatedAt:date,note:"رگرسیون تصویریِ ناحیهٔ بدنه معادل بازبینی کامل همهٔ صفحات نیست.",deps:["G03"],revision:"seed"},
  {id:"G05",title:"checksumهای نهایی",subtitle:"SHA-256 دارایی‌های v1.0.1",status:"pending",required:"manifest تازه برای DOCX/PDF نهایی و آزمون دانلود مجدد؛ نام فایل، اندازه و SHA-256 با QA یکسان.",stop:"استفاده از هش کاندید یا SHA256SUMS تاریخی rc1 به‌عنوان هش نهایی.",owner:"مسئول ساخت و کنترل فایل",url:repoFile("SHA256SUMS"),updatedAt:date,note:"SHA256SUMS فعلی شامل سه دارایی v1.0.0-rc1 است؛ manifest نهایی v1.0.1 نیست.",deps:["G03","G04"],revision:"seed"},
  {id:"G06",title:"metadata و استناد",subtitle:"نسخه، مجوز، DOI و لینک دارایی‌ها",status:"pending",required:"metadata جدید v1.0.1 منطبق با فایل‌های منجمد؛ DOI صرفاً پس از تأیید رکورد واقعی؛ ثبت اختلاف با نسخهٔ پایه.",stop:"DOI فرضی، نسخهٔ ناهماهنگ یا تعمیم مجوز کتاب به فونت تجاری.",owner:"مسئول نشر و استناد",url:repoFile("CITATION.cff"),updatedAt:date,note:"CITATION.cff هنوز version 1.0.0 و DOI تاریخی را دارد. مجوز CC-BY کتاب مجوز فونت نیست.",deps:["G05"],revision:"seed"},
  {id:"G07",title:"حفاظت از نسخهٔ پایه",subtitle:"v1.0.0 و Figshare v2 دست‌نخورده",status:"documented",required:"ثبت manifest و شناسهٔ دارایی‌های تاریخی؛ مقایسهٔ بایت/هش قبل و بعد و تأیید عدم تغییر tag یا فایل‌های پایه.",stop:"هر بازنویسی tag، جایگزینی دارایی قدیمی یا تغییر رکورد Figshare v2.",owner:"امین آرشیو / صاحب مخزن",url:INTAKE_URL,updatedAt:date,note:"سند ۶ نوامبر تطابق دارایی‌های GitHub و Figshare v2 را گزارش می‌کند. اختلاف FINAL_QA تاریخی با ضمیمهٔ release باید در مقایسه حفظ شود.",deps:[],revision:"seed"},
  {id:"G08",title:"بازبینی و merge",subtitle:"مرحلهٔ ثبت مدرک، بدون اجرای عملیات",status:"locked",required:"عبور G01 تا G07، تأیید بازبین و CI مرتبط؛ سپس ثبت merge SHA واقعی در صورت اقدام جداگانهٔ مجاز.",stop:"هر پیش‌نیاز باز، PR Draft یا نبود تأیید مستقل.",owner:"نگه‌دارندهٔ مخزن",url:PR_URL,updatedAt:date,note:"PR باز و Draft است. mergeable بودن به معنی آمادگی انتشار نیست.",deps:["G01","G02","G03","G04","G05","G06","G07"],external:true,revision:"seed"},
  {id:"G09",title:"tag و GitHub release",subtitle:"smart-structures-v1.0.1",status:"locked",required:"tag روی SHA تأییدشده، release notes و دارایی‌های منطبق با manifest؛ فقط ثبت شواهد اقدامِ مجاز جداگانه.",stop:"نبود merge SHA، اختلاف هش یا دست‌کاری نسخهٔ عمومی قبلی.",owner:"مسئول انتشار",url:"https://github.com/y0bahrambeigi/bhb/releases",updatedAt:date,note:"هیچ tag یا release از این داشبورد ایجاد نمی‌شود.",deps:["G08"],external:true,revision:"seed"},
  {id:"G10",title:"آرشیو Figshare v3",subtitle:"نسخهٔ جدید با رکورد و فایل قابل راستی‌آزمایی",status:"locked",required:"لینک واقعی نسخهٔ سوم، DOI تأییدشده، فایل‌ها و هش همسان با GitHub؛ حفظ v2 و تکمیل تطبیق metadata.",stop:"انتشار قبل از پیش‌نیازها، DOI حدسی یا جایگزینی فایل v2.",owner:"مسئول آرشیو علمی",url:"https://doi.org/10.6084/m9.figshare.34063335.v2",updatedAt:date,note:"لینک موجود مربوط به v2 است؛ مدرک انتشار v3 در این ثبت وجود ندارد.",deps:["G09"],external:true,revision:"seed"},
];

export const CRITERIA = [
  ["rtl","جهت و پیوستگی متن فارسی"],["fonts","Regular / Bold و نبود fallback"],
  ["math","معادلات و نمادهای ریاضی"],["tables","جداول و جداول تو‌در‌تو"],
  ["figures","شکل‌ها و زیرنویس‌ها"],["headers","سربرگ، پابرگ و شمارهٔ صفحه"],
  ["breaks","شکست صفحه و نبود بریدگی"],["visual","خوانایی و فاصله‌گذاری در اندازهٔ کامل"],
] as const;
export type Evidence = {id:string;gate:string;title:string;note:string;url:string;fileId?:string;fileName?:string;sha256?:string;size?:number;kind:string;reviewer:string;createdAt:string;source?:string};
export type Run = {id:string;title:string;pdfHash:string;commit:string;renderer:string;reviewer:string;createdAt:string};
export type Review = {runId:string;page:number;checks:Record<string,string>;note:string;reviewer:string;evidenceUrl:string;updatedAt:string;revision:string};
export type Comparison = {id:string;baselineName:string;candidateName:string;baselineHash:string;candidateHash:string;baselineSize:number;candidateSize:number;note:string;createdAt:string};
export type AuditEvent = {seq:number;id:string;actor:string;kind:string;entity:string;payload:Record<string,unknown>;createdAt:string};
export type AuditState = {gates:Gate[];evidence:Evidence[];runs:Run[];reviews:Review[];comparisons:Comparison[];events:AuditEvent[];authenticated:boolean;userName:string;decision:"NO-GO"};
export const EMAIL_DRAFT = `گیرنده: info@bornaray.com
موضوع: درخواست مجوز کتبی استفاده و embedding فونت B Nazanin در کتاب «سازه‌های هوشمند»

مدیریت محترم شرکت برنا رایانه
با سلام و احترام
برای آماده‌سازی نسخهٔ v1.0.1 کتاب «سازه‌های هوشمند و کنترل پاسخ لرزه‌ای»، قصد استفاده از فونت B Nazanin Regular و Bold نسخهٔ 2.01 را داریم. خواهشمند است صاحب حقوق و شرایط مجاز استفاده از این دو چهره را اعلام فرمایید و مشخص کنید آیا استفاده در متن کتاب، embedding کامل یا subset در PDF، embedding در DOCX و توزیع دیجیتال عمومی فایل‌های خروجی مجاز است یا به خرید مجوز جداگانه نیاز دارد.
لطفاً دامنهٔ مجوز، شرایط انتساب، محدودیت توزیع، هزینهٔ احتمالی و الزامات فنی را به‌صورت کتبی اعلام فرمایید. فایل خام فونت در مخزن یا ضمیمهٔ انتشار توزیع نخواهد شد. مجوز متن کتاب مستقل از حقوق فونت بررسی می‌شود.
با احترام
یوسف بهرام بیگی

وضعیت: پیش‌نویس ارسال‌نشده؛ صرفاً مدرک / یادآوری و فاقد ارزش به‌عنوان مجوز.`;

export const SEED_EVIDENCE: Evidence[] = [
 {id:"source-intake",gate:"G02",title:"احراز دو چهرهٔ رسمی فونت",note:"مستند مخزن در ۶ نوامبر: Regular وزن 400 و Bold وزن 700؛ مستقل از مجوز انتشار. هش Bold: 2293311d5738f48bf7dbf3bb38e1b7fa1475e955893e0b026258493ac1d4658c",url:INTAKE_URL,kind:"repository",reviewer:"گزارش موجود در مخزن",createdAt:date,source:HEAD},
 {id:"source-render",gate:"G03",title:"رندر داخلی آزمایشی ۴۰ صفحه",note:"LibreOffice 26.8 alpha؛ subset فونت‌ها گزارش شده؛ جایگزین رندر پایدار و QA کامل نیست.",url:INTAKE_URL,kind:"repository",reviewer:"گزارش موجود در مخزن",createdAt:date,source:HEAD},
 {id:"source-baseline",gate:"G07",title:"تطابق فایل‌های نسخهٔ پایه",note:"سند مخزن تطابق بایت‌به‌بایت v1.0.0 با Figshare v2 را گزارش می‌کند؛ اختلاف فایل FINAL_QA تاریخی ثبت شده است.",url:INTAKE_URL,kind:"repository",reviewer:"گزارش موجود در مخزن",createdAt:date,source:HEAD},
 {id:"source-checksums",gate:"G05",title:"manifest تاریخی rc1",note:"خوانده‌شده در SHA فعلی PR؛ به سه دارایی rc1 اشاره دارد و برای v1.0.1 معتبر نیست.",url:repoFile("SHA256SUMS"),kind:"repository",reviewer:"خواندن مستقیم مخزن",createdAt:snapshot.retrievedAt,source:HEAD},
 {id:"source-metadata",gate:"G06",title:"metadata نسخهٔ 1.0.0",note:"CITATION.cff همچنان نسخهٔ 1.0.0 و DOI پایه را دارد.",url:repoFile("CITATION.cff"),kind:"repository",reviewer:"خواندن مستقیم مخزن",createdAt:snapshot.retrievedAt,source:HEAD},
 {id:"email-draft",gate:"G01",title:"پیش‌نویس درخواست مجوز — ارسال‌نشده",note:EMAIL_DRAFT,url:"",kind:"draft",reviewer:"پیش‌نویس برای صاحب اثر",createdAt:snapshot.retrievedAt},
];

export function materialize(events: AuditEvent[], authenticated=false, userName="") : AuditState {
 const gates = SEED_GATES.map(g=>({...g}));
 const gateSequences = new Map<string, number>();
 const pageSequences = new Map<string, number>();
 const evidence=[...SEED_EVIDENCE], runs:Run[]=[], reviews:Review[]=[], comparisons:Comparison[]=[];
 for(const e of events){
  if(e.kind==="gate"){ const i=gates.findIndex(g=>g.id===e.entity); if(i>=0){gates[i]={...gates[i],...e.payload,revision:e.id,updatedAt:e.createdAt} as Gate;gateSequences.set(e.entity,e.seq);} }
  if(e.kind==="evidence") evidence.push({...e.payload,id:e.id,createdAt:e.createdAt} as Evidence);
  if(e.kind==="qa-run") runs.push({...e.payload,id:e.id,createdAt:e.createdAt} as Run);
  if(e.kind==="qa-page"){ pageSequences.set(e.entity,e.seq); const r={...e.payload,revision:e.id,updatedAt:e.createdAt} as Review; const i=reviews.findIndex(p=>p.runId===r.runId&&p.page===r.page); if(i>=0)reviews[i]=r;else reviews.push(r); }
  if(e.kind==="comparison")comparisons.push({...e.payload,id:e.id,createdAt:e.createdAt} as Comparison);
 }
 for(const gate of gates){
  if(gate.status!=="verified") continue;
  const approvalSequence=gateSequences.get(gate.id) ?? 0;
  const changedDependency=gate.deps.some(id=>
   gates.find(dep=>dep.id===id)?.status!=="verified" || (gateSequences.get(id) ?? 0)>approvalSequence
  );
  const qaChanged=gate.id==="G04" && (
   !gate.runId || gates.find(dep=>dep.id==="G03")?.runId!==gate.runId ||
   Array.from({length:40},(_,i)=>i+1).some(page=>{
    const review=reviews.find(r=>r.runId===gate.runId&&r.page===page);
    return !review || !pagePassed(review) || (pageSequences.get(`${gate.runId}:${page}`) ?? 0)>approvalSequence;
   })
  );
  if(changedDependency || qaChanged){
   gate.status="review";
   gate.note+=qaChanged
    ?" [رندر یا بازبینی صفحات تغییر کرده است؛ تأیید دوبارهٔ QA لازم است.]"
    :" [یکی از پیش‌نیازها تغییر کرده است؛ تأیید دوبارهٔ این گیت لازم است.]";
  }
 }
 return {gates,evidence,runs,reviews,comparisons,events,authenticated,userName,decision:"NO-GO"};
}
export function pagePassed(r:Review){return CRITERIA.every(([key])=>r.checks[key]==="pass");}
export function faNumber(n:number){return new Intl.NumberFormat("fa-IR").format(n);}
export function formatDate(date:string){return new Intl.DateTimeFormat("fa-IR",{year:"numeric",month:"short",day:"numeric",timeZone:"America/Los_Angeles"}).format(new Date(date.length===10?date+"T12:00:00Z":date));}
