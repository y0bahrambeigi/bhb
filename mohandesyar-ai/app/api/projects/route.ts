import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { projects } from "../../../db/schema";

export async function GET() { try { const db=await getDb(); return Response.json({projects:await db.select().from(projects).orderBy(desc(projects.id)).limit(100)}); } catch { return Response.json({error:"داده‌های پروژه هنوز برای این محیط آماده نشده‌اند."},{status:503}); } }
export async function POST(request:Request) { const payload=await request.json() as {code?:string;title?:string;address?:string}; if(!payload.code?.trim()||!payload.title?.trim()||!payload.address?.trim()) return Response.json({error:"کد، عنوان و نشانی پروژه الزامی است."},{status:400}); const db=await getDb(); const [project]=await db.insert(projects).values({code:payload.code.trim(),title:payload.title.trim(),address:payload.address.trim(),createdAt:new Date().toISOString()}).returning(); return Response.json({project},{status:201}); }
