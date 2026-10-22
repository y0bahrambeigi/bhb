import data from './data/runs.json';
export const runs = data;
export const methods = ['BMPOA-FF-core','BMPOA-FF-RandomDiscreteLS','BMPOA-FF-SGDLS'];
export const labels = ['Core','Random LS','SG-DLS'];
export const source = 'https://github.com/y0bahrambeigi/bhb/actions/runs/39207965973';
export const provenance = { run: '39207965973', commit: 'a8d9fc46966842ec56980853a4ee4ab56395a7e0', artifact: '12168833062', csvSHA256: '2e13eba58e4ccbfb9f3e8b28fd359bba337edd01717d6264ffc49f5b37fc590e', date: '2026-10-19' };
export const median=(v:number[])=>{const a=[...v].sort((a,b)=>a-b);return a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2;};
export function summaries(benchmark:string) {return methods.map(algorithm=>{ const r=runs.filter(x=>x.benchmark.startsWith(benchmark+'-')&&x.algorithm===algorithm);return {algorithm,n:r.length,feasible:r.filter(x=>x.feasible===1).length,meanWeight:r.reduce((a,x)=>a+x.weight,0)/r.length,medianWeight:median(r.map(x=>x.weight)),medianTime:median(r.map(x=>x.elapsed_seconds)),first:median(r.map(x=>x.first_feasible_FE)),attempts:r.reduce((a,x)=>a+x.sgdls_attempts,0),accepted:r.reduce((a,x)=>a+x.sgdls_accepted,0)};});}
export const caveats = [
 ['۵ seed، نه ۳۰ تکرار مستقل','۳۰ ردیف از ۲ مدل × ۳ روش × ۵ seed تشکیل شده‌اند. برتری آماری SG-DLS اثبات نشده است.'],
 ['اولین طرح مجاز از FE=1','فرد اول جمعیت از نقطه میانی حدود متغیرها ساخته شده و مجاز است؛ این داده‌ها سرعت تعمیر طرح نامجاز را نمی‌سنجند.'],
 ['افت پذیرش در seed 2030','در 72-bar، تعداد پذیرش SG-DLS برابر ۲۵ از ۲۳۹ تلاش است؛ علت افت پذیرش هنوز باز است.'],
 ['هزینه حساسیت جداگانه','بودجه برابر فراخوانی ارزیاب به معنای زمان یا هزینه محاسباتی برابر نیست.'],
 ['حساسیت مودهای نزدیک تکراری','اندازه خوشه مودال تا ۲ ثبت شده است. آزمون مستقل دقت مشتق‌ها در هر دو جهت تغییر سطح مقطع هنوز لازم است.'],
 ['تاریخچه همگرایی موجود نیست','فایل‌های MAT فقط جدول نتایج را نگه داشته‌اند؛ نمودار همگرایی تاریخی از این داده‌ها قابل بازسازی نیست.']
];
