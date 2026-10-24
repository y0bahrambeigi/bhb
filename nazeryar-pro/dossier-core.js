/* Nazeryar building dossier generator. Original application code © Yousef Bahram Beigi. */
(function(root){
'use strict';
const fa=n=>Number(n).toLocaleString('fa-IR');
function timeValue(r){if(Number.isFinite(r.sortTimestamp))return r.sortTimestamp;if(Number.isFinite(r.visitTimestamp))return r.visitTimestamp;const s=r.fields?.visit||r.fields?.reportDate||r.savedAt;const n=Date.parse(s);return Number.isFinite(n)?n:Infinity}
function sortReports(records){return [...records].sort((a,b)=>timeValue(a)-timeValue(b)||String(a.id).localeCompare(String(b.id)))}
function labelDate(s){if(!s)return 'ثبت نشده';const d=new Date(s);return isNaN(d)?'نامعتبر':new Intl.DateTimeFormat('fa-IR',{dateStyle:'medium',timeStyle:'short'}).format(d)}
function clean(s){return String(s??'').replace(/\r/g,'')}
async function buildDossier(records,property,adapter){
 const PDF=adapter.PDFLib,doc=await PDF.PDFDocument.create();doc.setTitle('Building Technical Dossier - Nazeryar PRO');doc.setAuthor('Yousef Bahram Beigi');doc.setSubject('Chronological inspection records with original media attachments');doc.setProducer('Nazeryar PRO');
 const reports=sortReports(records);if(!reports.length)throw Error('هیچ گزارش بایگانی‌شده‌ای برای این ساختمان وجود ندارد.');
 const W=1240,H=1754,M=92,BOTTOM=1600;let canvas,ctx,y,pageNo=0,dirty=false;const stats={pages:0,attachments:0,videos:0,images:0,thumbnailFailures:0};
 const font=size=>`${size}px NazaninDossier, "DejaVu Sans", Arial, sans-serif`;
 function start(){canvas=adapter.createCanvas(W,H);ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.direction='rtl';ctx.textAlign='right';ctx.textBaseline='alphabetic';ctx.fillStyle='#164f56';ctx.fillRect(M,65,W-2*M,4);ctx.font=font(25);ctx.fillText('ناظریار | پرونده مستندات فنی و ملکی ساختمان',W-M,110);ctx.fillStyle='#71808a';ctx.textAlign='left';ctx.font='17px sans-serif';ctx.fillText('NAZERYAR PRO',M,110);ctx.textAlign='right';y=175;dirty=false}
 async function flush(){if(!canvas||!dirty)return;pageNo++;ctx.fillStyle='#c8d1d5';ctx.fillRect(M,1640,W-2*M,1);ctx.fillStyle='#6c7d85';ctx.font=font(23);ctx.textAlign='right';ctx.fillText('یوسف بهرام بیگی | پرونده مستندات؛ فاقد اعتبار شناسنامه رسمی',W-M,1684);ctx.textAlign='left';ctx.fillText(fa(pageNo),M,1684);const bytes=adapter.canvasBytes?await adapter.canvasBytes(canvas):await (await fetch(canvas.toDataURL('image/png'))).arrayBuffer();const image=await doc.embedPng(bytes);const page=doc.addPage([595.28,841.89]);page.drawImage(image,{x:0,y:0,width:595.28,height:841.89});stats.pages++;adapter.onProgress?.(`صفحه ${fa(pageNo)} آماده شد`)}
 async function next(){await flush();start()}
 async function room(height){if(y+height>BOTTOM)await next()}
 async function line(text,size=31,color='#253b47',indent=0){await room(size*1.55);ctx.font=font(size);ctx.fillStyle=color;ctx.textAlign='right';ctx.fillText(clean(text),W-M-indent,y);y+=size*1.55;dirty=true}
 async function text(text,size=30,color='#253b47'){ctx.font=font(size);for(const raw of clean(text).split('\n')){if(!raw.trim()){y+=size*.5;continue}let current='';for(const word of raw.split(/\s+/)){const attempt=current?current+' '+word:word;ctx.font=font(size);if(ctx.measureText(attempt).width>W-2*M&&current){await line(current,size,color);current=''}ctx.font=font(size);if(ctx.measureText(word).width>W-2*M){if(current){await line(current,size,color);current=''}let part='';for(const ch of word){if(ctx.measureText(part+ch).width>W-2*M){await line(part,size,color);part=''}part+=ch}current=part}else current=current?current+' '+word:word}if(current)await line(current,size,color)}}
 async function heading(t){await room(110);y+=15;ctx.fillStyle='#edf4f4';ctx.fillRect(M,y-37,W-2*M,65);await line(t,36,'#164f56');y+=25}
 start();await line('پرونده مستندات فنی و ملکی ساختمان',54,'#164f56');await text(property.name||reports[0].fields?.project||'ساختمان',41);await line('گزارش‌های ثبت‌شده، به ترتیب تاریخ و ساعت',30,'#70828b');y+=40;
 const props=[['کد پرونده / پلاک ثبتی',property.code],['مالک / نماینده',property.owner],['نشانی ساختمان',property.address],['کاربری',property.usage],['مساحت زمین',property.landArea],['زیربنای اعلام‌شده',property.builtArea],['تعداد طبقات',property.floors],['سیستم سازه',property.structure],['مرجع پروانه',property.permit],['توضیحات ملکی و حدود اطلاعات',property.notes]];
 for(const [k,v] of props)await text(k+' : '+(v||'ثبت نشده'),31);
 await text('این فایل تجمیع اطلاعات ثبت‌شده توسط کاربران است؛ جایگزین شناسنامه فنی و ملکی رسمی، تأیید مرجع ذی‌صلاح یا امضای مهندس نیست.',28,'#946c39');await text('ترتیب بازدیدها براساس تاریخ و ساعت اعلام‌شده است. زمان‌های بدون منطقه زمانی، با ساعت محلی دستگاه تفسیر می‌شوند. زمان افزودن فایل یا زمان واردشده توسط کاربر، اصالت زمان تصویربرداری را اثبات نمی‌کند.',27,'#70828b');
 await heading('فهرست زمانی گزارش‌ها');for(let i=0;i<reports.length;i++){const r=reports[i];await text(`${fa(i+1)}. ${labelDate(r.fields?.visit||r.fields?.reportDate)} | ${r.fields?.engineer||'مهندس ثبت نشده'} | ${fa(r.media?.length||0)} پیوست`,29)}
 await text('عکس‌ها در صفحات درج شده‌اند؛ اصل عکس و فیلم در پیوست داخلی PDF قرار دارد. پیوست‌ها را در نرم‌افزار سازگار با PDF مانند Adobe Acrobat Reader باز کنید. نمایش مستقیم فیلم در همه نمایشگرها پشتیبانی نمی‌شود.',28,'#70828b');
 for(let i=0;i<reports.length;i++){
 const r=reports[i];const kind=r.recordKind==='desk_review'?'بررسی اسنادی':'بازدید';await next();await heading(`${kind} ${fa(i+1)} | ${labelDate(r.fields?.visit||r.fields?.reportDate)}`);await text(`شناسه گزارش: ${r.id}`,24,'#70828b');await text(`منطقه زمانی ثبت گزارش: ${r.visitZone||'ثبت نشده'}`,25,'#70828b');await text(`زمان بایگانی: ${labelDate(r.savedAt)} | ${r.reviewed?'بازبینی‌شده توسط کاربر':'بازبینی‌نشده'} | بدون امضا`,27,'#70828b');
 if(r.recordKind==='desk_review')await text('نمونه مستند بر پایه منابع عمومی - بازدید میدانی انجام نشده؛ تنظیم‌کننده، ناظر این پروژه نیست.',29,'#946c39');await text(r.reportText||'متن گزارش ثبت نشده است.');
 await heading('شواهد و پیوست‌های این گزارش');if(!r.media?.length)await text('پیوستی ثبت نشده است.');
 for(let j=0;j<(r.media||[]).length;j++){
 const m=r.media[j];if(!(m.blob instanceof Blob))throw Error('فایل پیوست قابل خواندن نیست: '+m.name);
 const video=m.type?.startsWith('video/');const ext=(m.name.match(/\.[a-zA-Z0-9]{1,8}$/)||[video?'.mp4':'.jpg'])[0];const filename=`visit-${String(i+1).padStart(3,'0')}-media-${String(j+1).padStart(3,'0')}${ext}`;
 await room(1000);await heading(`پیوست ${fa(j+1)} | ${video?'فیلم':'عکس'}`);await text(m.caption||'توضیح شاهد ثبت نشده است.',29);await text(`نام فایل: ${m.name} | زمان افزودن: ${labelDate(m.added)}`,25,'#70828b');await text(`زمان تصویربرداری اعلام‌شده: ${labelDate(m.captureTime)} | حجم: ${fa((m.blob.size/1048576).toFixed(1))} مگابایت`,25,'#70828b');
 let picture;try{picture=video?await adapter.videoThumbnail(m.blob):await adapter.imageFromBlob(m.blob)}catch{stats.thumbnailFailures++;await text('پیش‌نمایش این فایل قابل تهیه نبود؛ اصل فایل در پیوست PDF موجود است.',27,'#946c39')}
 if(picture){const iw=picture.naturalWidth||picture.width,ih=picture.naturalHeight||picture.height;if(iw&&ih){const scale=Math.min((W-2*M)/iw,600/ih);const dw=iw*scale,dh=ih*scale;await room(dh+40);ctx.drawImage(picture,(W-dw)/2,y,dw,dh);y+=dh+35;dirty=true}adapter.releaseImage?.(picture)}
 await text('فایل اصلی در پیوست داخلی PDF: '+filename,24,'#164f56');await doc.attach(await m.blob.arrayBuffer(),filename,{mimeType:m.type||'application/octet-stream',description:clean(m.name+' | '+(m.caption||''))});stats.attachments++;if(video)stats.videos++;else stats.images++;
 }
 }
 await flush();return {bytes:await doc.save(),stats};
}
root.NazeryarDossier={sortReports,timeValue,labelDate,buildDossier};if(typeof module!=='undefined')module.exports=root.NazeryarDossier;
})(typeof globalThis!=='undefined'?globalThis:this);
