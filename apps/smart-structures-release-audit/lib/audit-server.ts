import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { materialize, type AuditEvent } from "./audit-model";

export async function readState() {
 const user=await getChatGPTUser();
 if(!user) return materialize([]);
 if(!env.DB) throw new Error("پایگاه داده در دسترس نیست؛ هیچ تغییر محلی به‌جای ذخیرهٔ واقعی ثبت نمی‌شود.");
 const {results}=await env.DB.prepare("SELECT seq, id, actor, kind, entity, payload, created_at AS createdAt FROM audit_events WHERE owner_id = ? ORDER BY seq ASC").bind(user.userId).all();
 const events=results.map(r=>({...r,payload:JSON.parse(r.payload as string)})) as AuditEvent[];
 return materialize(events,true,user.displayName);
}

export async function appendEvent(kind:string,entity:string,payload:unknown,expectedRevision?:string,id=crypto.randomUUID(),checkedSequence?:number){
 const user=await getChatGPTUser();
 if(!user)throw new Error("AUTH_REQUIRED");
 if(!env.DB)throw new Error("پایگاه داده در دسترس نیست.");
 const params=[id,user.userId,user.displayName,kind,entity,JSON.stringify(payload),new Date().toISOString()];
 if(expectedRevision!==undefined){
  const auditGuard=checkedSequence===undefined?"":" AND COALESCE((SELECT MAX(seq) FROM audit_events WHERE owner_id=?),0)=?";
  const guardParams=checkedSequence===undefined?[]:[user.userId,checkedSequence];
  const result=await env.DB.prepare(
   "INSERT INTO audit_events (id,owner_id,actor,kind,entity,payload,created_at) SELECT ?,?,?,?,?,?,? WHERE COALESCE((SELECT id FROM audit_events WHERE owner_id=? AND kind=? AND entity=? ORDER BY seq DESC LIMIT 1),'seed')=?" + auditGuard
  ).bind(...params,user.userId,kind,entity,expectedRevision,...guardParams).run();
  if(result.meta.changes!==1) throw new Error("CONFLICT");
 }else{
  await env.DB.prepare("INSERT INTO audit_events (id,owner_id,actor,kind,entity,payload,created_at) VALUES (?,?,?,?,?,?,?)").bind(...params).run();
 }
 return id;
}

export async function mutationResponse(){
 try {
  return Response.json(await readState(),{headers:{"Cache-Control":"no-store"}});
 } catch {
  // The write has committed. The client can reload the state without resubmitting it.
  return Response.json({saved:true},{status:201,headers:{"Cache-Control":"no-store"}});
 }
}

export function checkOrigin(request:Request){
 const origin=request.headers.get("origin");
 if(origin && origin!==new URL(request.url).origin)throw new Error("ORIGIN_DENIED");
 if(request.headers.get("sec-fetch-site")==="cross-site")throw new Error("ORIGIN_DENIED");
}
export function apiError(error:unknown){
 const message=error instanceof Error?error.message:"ثبت اطلاعات انجام نشد.";
 const status=message==="AUTH_REQUIRED"?401:message==="CONFLICT"?409:message==="ORIGIN_DENIED"?403:400;
 return Response.json({error:message==="CONFLICT"?"اطلاعات در جلسهٔ دیگری تغییر کرده؛ صفحه را تازه‌سازی و دوباره بررسی کنید.":message==="AUTH_REQUIRED"?"برای ذخیرهٔ امن، ورود به حساب لازم است.":message},{status});
}
