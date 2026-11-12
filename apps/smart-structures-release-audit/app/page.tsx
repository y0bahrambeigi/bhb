import Dashboard from "./dashboard";
import { readState } from "@/lib/audit-server";
import { materialize } from "@/lib/audit-model";
export const dynamic="force-dynamic";
export default async function Home(){
 try{return <Dashboard initial={await readState()} />;}
 catch{return <Dashboard initial={materialize([])} initialError="دریافت سوابق ذخیره‌شده انجام نشد؛ نمایش فعلی صرفاً snapshot مخزن است. پیش از ثبت اطلاعات دوباره تلاش کنید." />;}
}
