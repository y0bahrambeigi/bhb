import { env } from "cloudflare:workers";
import { appendEvent, apiError, checkOrigin, mutationResponse, readState } from "@/lib/audit-server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { z } from "zod";
export const dynamic="force-dynamic";
const schema=z.object({gate:z.string(),title:z.string().trim().min(3).max(200),note:z.string().trim().min(8).max(15000),url:z.string().max(3000).refine(s=>!s||/^https?:\/\//i.test(s)),reviewer:z.string().trim().min(2).max(160),kind:z.enum(["document","link","draft"])});
export async function POST(request:Request){
 let fileKey:string|undefined;
 try{
  checkOrigin(request);
  const user=await getChatGPTUser();if(!user)throw new Error("AUTH_REQUIRED");
  if(Number(request.headers.get("content-length")||0)>16*1024*1024)throw new Error("حداکثر اندازهٔ فایل ۱۵ مگابایت است.");
  const form=await request.formData();
  const p=schema.parse(Object.fromEntries(["gate","title","note","url","reviewer","kind"].map(k=>[k,form.get(k)||""])));
  const state=await readState();if(!state.gates.some(g=>g.id===p.gate))throw new Error("گیت نامعتبر است.");
  const file=form.get("file"),id=crypto.randomUUID();
  let attachment={};
  if(file instanceof File && file.size>0){
   if(file.size>15*1024*1024)throw new Error("حداکثر اندازهٔ فایل ۱۵ مگابایت است.");
   if(!/\.(pdf|png|jpe?g|webp|docx|txt|md|json|csv|eml|cff)$/i.test(file.name))throw new Error("نوع فایل پشتیبانی نمی‌شود. فایل خام فونت پذیرفته نمی‌شود.");
   if(!env.BUCKET)throw new Error("فضای نگهداری فایل در دسترس نیست.");
   const bytes=await file.arrayBuffer();
   const digest=await crypto.subtle.digest("SHA-256",bytes);
   const sha256=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");
   fileKey=`evidence/${user.userId}/${id}`;
   await env.BUCKET.put(fileKey,bytes,{httpMetadata:{contentType:"application/octet-stream"}});
   attachment={fileId:id,fileName:file.name.slice(0,250),sha256,size:file.size};
  }
  await appendEvent("evidence",p.gate,{...p,...attachment},undefined,id);
 }catch(e){
  if(fileKey&&env.BUCKET)await env.BUCKET.delete(fileKey).catch(()=>{});
  return apiError(e);
 }
 return mutationResponse();
}
export async function GET(request:Request){
 try{
  const user=await getChatGPTUser();if(!user)throw new Error("AUTH_REQUIRED");
  const id=new URL(request.url).searchParams.get("id");
  const state=await readState(),record=state.evidence.find(e=>e.fileId===id);
  if(!record) return new Response("فایل یافت نشد.",{status:404});
  const file=await env.BUCKET?.get(`evidence/${user.userId}/${id}`);
  if(!file) return new Response("فایل یافت نشد.",{status:404});
  return new Response(file.body,{headers:{"Content-Type":"application/octet-stream","Content-Disposition":`attachment; filename="evidence-${id}"; filename*=UTF-8''${encodeURIComponent(record.fileName||"evidence")}`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
 }catch(e){return apiError(e);}
}
