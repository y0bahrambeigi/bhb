"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, Clock3, MapPin, Menu, MessageSquareText, Newspaper, Send, Sparkles, Users, Vote, X } from "lucide-react";

const news = [
  { tag: "شهر و مدیریت", title: "شفافیت بودجه؛ نقشه‌ای روشن برای تصمیم‌های شهر", text: "مدیریت شهری زمانی اعتماد می‌سازد که شهروندان بدانند منابع عمومی کجا و چگونه هزینه می‌شود.", date: "امروز · ۱۰:۳۰", accent: "cyan" },
  { tag: "دیدگاه", title: "ارومیه؛ شهر فرصت‌ها، گفت‌وگو و تصمیم‌های کارشناسی", text: "راه‌حل مسائل شهری از شنیدن صدای محله‌ها و تبدیل پیشنهادهای مردم به برنامه اجرایی می‌گذرد.", date: "امروز · ۰۸:۱۵", accent: "pink" },
  { tag: "حامیان", title: "دعوت از متخصصان و جوانان برای ارائه ایده‌های شهری", text: "پیشنهادهای کاربردی در حوزه حمل‌ونقل، محیط‌زیست، ایمنی و اقتصاد شهری گردآوری می‌شود.", date: "دیروز · ۱۹:۴۰", accent: "blue" },
];

const pollOptions = ["شفافیت و پاسخ‌گویی", "حمل‌ونقل و ترافیک", "محیط‌زیست و دریاچه ارومیه", "ایمنی و نوسازی شهری"];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [voted, setVoted] = useState(false);
  const [sent, setSent] = useState(false);
  const [paperOpen, setPaperOpen] = useState(false);
  const counts = useMemo(() => [38, 29, 21, 12].map((n, i) => n + (voted && selected === i ? 1 : 0)), [voted, selected]);
  const total = counts.reduce((a, b) => a + b, 0);

  function submitNews(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); event.currentTarget.reset(); }

  return (
    <main dir="rtl" className="min-h-screen overflow-x-hidden bg-[#030b1d] text-white">
      <div className="aurora" />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#041027]/85 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="صفحه نخست"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_30px_#22d3ee66]"><Users size={22}/></span><span><b className="block text-base sm:text-lg">حامیان دکتر علی شیخ محمدی</b><small className="text-cyan-200/70">ارومیه، شهر فرصت‌ها</small></span></a>
          <nav className="hidden items-center gap-7 text-sm text-blue-100/75 md:flex"><a href="#news">اخبار</a><a href="#newspaper">شبه‌روزنامه</a><a href="#poll">نظرسنجی</a><a href="#submit">ارسال خبر</a></nav>
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl border border-white/10 p-2.5 md:hidden" aria-label="باز کردن منو">{menuOpen ? <X/> : <Menu/>}</button>
        </div>{menuOpen && <nav className="grid gap-2 border-t border-white/10 px-5 py-4 text-sm md:hidden"><a href="#news">اخبار روزانه</a><a href="#newspaper">شبه‌روزنامه</a><a href="#poll">نظرسنجی</a><a href="#submit">ارسال خبر</a></nav>}
      </header>

      <section id="top" className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-20">
        <div className="relative z-10"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200"><Sparkles size={16}/> رسانه مستقل حامیان و شهروندان ارومیه</div><h1 className="max-w-3xl text-4xl font-black leading-[1.35] sm:text-6xl">برای ارومیه‌ای <span className="gradient-text">شفاف‌تر، هوشمندتر</span> و انسانی‌تر</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100/70">پایگاه خبر، گفت‌وگو و مشارکت شهروندی حامیان دکتر علی شیخ محمدی؛ جایی برای شنیدن صدای محله‌ها و ساختن برنامه‌ای مبتنی بر تخصص.</p><div className="mt-8 flex flex-wrap gap-3"><a href="#poll" className="primary-btn"><Vote size={19}/> شرکت در نظرسنجی</a><button onClick={() => setPaperOpen(true)} className="secondary-btn"><Newspaper size={19}/> ورق‌زدن روزنامه</button></div><div className="mt-10 flex flex-wrap gap-7 text-sm text-blue-100/60"><span className="flex items-center gap-2"><MapPin size={17} className="text-cyan-300"/> شورای اسلامی شهر ارومیه</span><span className="flex items-center gap-2"><MessageSquareText size={17} className="text-pink-400"/> رسانه‌ای برای گفت‌وگوی محترمانه</span></div></div>
        <div className="relative mx-auto w-full max-w-[480px]"><div className="poster-glow"/><img src="/candidate-poster.jpeg" alt="پوستر سوابق دکتر علی شیخ محمدی" className="relative z-10 w-full rounded-[2rem] border border-white/20 object-cover shadow-2xl"/><div className="absolute -bottom-5 -right-3 z-20 rounded-2xl border border-cyan-300/20 bg-[#061532]/90 px-5 py-4 shadow-xl backdrop-blur-xl"><small className="text-blue-200/60">اصل راهبردی</small><b className="mt-1 block">تخصص، برنامه، پاسخ‌گویی</b></div></div>
      </section>

      <section id="news" className="section-shell"><div className="section-title"><div><span>تازه‌ترین روایت شهر</span><h2>اخبار روزانه</h2></div><a href="#submit" className="text-sm text-cyan-300">خبر دارید؟ برای ما بفرستید</a></div><div className="grid gap-5 lg:grid-cols-3">{news.map((item, i) => <article key={item.title} className="news-card"><div className={`news-number ${item.accent}`}>۰{i + 1}</div><div className="flex items-center justify-between text-xs"><span className="rounded-full bg-white/8 px-3 py-1 text-cyan-200">{item.tag}</span><span className="flex items-center gap-1 text-blue-100/45"><Clock3 size={13}/>{item.date}</span></div><h3>{item.title}</h3><p>{item.text}</p><button className="mt-auto flex items-center gap-1 pt-5 text-sm text-cyan-300">ادامه خبر <ChevronLeft size={16}/></button></article>)}</div></section>

      <section id="newspaper" className="section-shell grid items-stretch gap-6 lg:grid-cols-[.9fr_1.1fr]"><div className="paper-cover"><div className="paper-mast"><span>شماره نخست · ویژه شهروندان</span><h2>صدای ارومیه</h2><span>شبه‌روزنامه حامیان</span></div><div className="grid grid-cols-[1fr_105px] gap-4 border-y border-slate-900 py-4"><div><h3>شهر را با مردم<br/>دوباره می‌سازیم</h3><p>گفت‌وگویی درباره شفافیت، مدیریت تخصصی و آینده محله‌های ارومیه</p></div><img src="/candidate-poster.jpeg" alt="دکتر علی شیخ محمدی" className="h-36 w-full object-cover object-top grayscale"/></div><div className="paper-columns">بودجه شهری فقط یک جدول مالی نیست؛ نقشه تصمیم‌های شهر است. شهروند باید بتواند مسیر هر تصمیم، هزینه و نتیجه آن را ببیند. مشارکت عمومی از جایی آغاز می‌شود که پرسش‌گری محترم شمرده شود و پاسخ‌گویی یک وظیفه باشد.</div></div><div className="glass-panel flex flex-col justify-center p-7 sm:p-10"><span className="eyebrow">یک تجربه متفاوت</span><h2 className="mt-3 text-3xl font-black sm:text-4xl">روزنامه‌ای که هر روز با صدای شما کامل می‌شود</h2><p className="mt-5 leading-8 text-blue-100/65">خلاصه خبرها، روایت محله‌ها، وعده‌های قابل‌سنجش و دیدگاه کارشناسان در قالبی خلاق و خواندنی.</p><button onClick={() => setPaperOpen(true)} className="primary-btn mt-7 w-fit"><Newspaper size={19}/> مشاهده نسخه امروز</button></div></section>

      <section id="poll" className="section-shell grid gap-6 lg:grid-cols-[1fr_.75fr]"><div className="glass-panel p-6 sm:p-9"><span className="eyebrow">نظرسنجی هفته</span><h2 className="mt-3 text-2xl font-black sm:text-3xl">مهم‌ترین اولویت شورای آینده ارومیه چیست؟</h2><p className="mt-2 text-sm text-blue-100/55">هر دستگاه فقط یک‌بار رأی خود را ثبت کند.</p><div className="mt-7 space-y-3">{pollOptions.map((option, i) => { const pct = Math.round(counts[i] / total * 100); return <button key={option} disabled={voted} onClick={() => setSelected(i)} className={`poll-option ${selected === i ? "selected" : ""}`}><span>{option}</span>{voted ? <b>{pct}٪</b> : <span className="radio-dot"/>}{voted && <i style={{width:`${pct}%`}}/>}</button>})}</div><button disabled={selected === null || voted} onClick={() => setVoted(true)} className="primary-btn mt-6 disabled:cursor-not-allowed disabled:opacity-40">{voted ? <><CheckCircle2 size={19}/> رأی شما ثبت شد</> : <><Vote size={19}/> ثبت رأی</>}</button></div><aside className="impact-card"><Vote size={42}/><strong>{total.toLocaleString("fa-IR")}</strong><span>مشارکت ثبت‌شده</span><p>نتیجه این نظرسنجی غیررسمی است و برای شناخت بهتر اولویت‌های شهروندان منتشر می‌شود.</p></aside></section>

      <section id="submit" className="section-shell"><div className="glass-panel grid overflow-hidden lg:grid-cols-[.7fr_1.3fr]"><div className="submit-intro"><Send size={34}/><h2>خبر محله شما چیست؟</h2><p>رویدادها، مشکلات و پیشنهادهای محله خود را برای بررسی هیئت تحریریه ارسال کنید.</p></div><form onSubmit={submitNews} className="grid gap-4 p-6 sm:grid-cols-2 sm:p-9"><label>نام و نام خانوادگی<input required name="name" placeholder="نام شما"/></label><label>شماره تماس<input required name="phone" inputMode="tel" placeholder="برای پیگیری خبر"/></label><label className="sm:col-span-2">عنوان خبر<input required name="title" placeholder="یک عنوان کوتاه و روشن"/></label><label className="sm:col-span-2">شرح خبر<textarea required name="body" rows={4} placeholder="جزئیات، زمان و محل رویداد را بنویسید"/></label><button className="primary-btn w-fit sm:col-span-2"><Send size={18}/> ارسال برای بررسی</button>{sent && <p className="success sm:col-span-2"><CheckCircle2 size={18}/> خبر شما دریافت شد و پس از بررسی منتشر می‌شود.</p>}</form></div></section>

      <footer className="mt-16 border-t border-white/10 bg-[#020817] py-10"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 text-sm text-blue-100/45 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div><b className="text-white">حامیان دکتر علی شیخ محمدی</b><p className="mt-1">رسانه مردمی گفت‌وگو درباره آینده ارومیه</p></div><p>این پایگاه، نظرات کاربران را پس از بررسی منتشر می‌کند.</p></div></footer>

      {paperOpen && <div className="modal" role="dialog" aria-modal="true" aria-label="نسخه امروز صدای ارومیه"><button onClick={() => setPaperOpen(false)} className="modal-close" aria-label="بستن"><X/></button><div className="paper-cover modal-paper"><div className="paper-mast"><span>پنج‌شنبه ۱۹ شهریور</span><h2>صدای ارومیه</h2><span>شماره ۰۰۱</span></div><h3 className="paper-lead">تخصص و شفافیت؛ دو ستون تصمیم‌گیری شهری</h3><img src="/candidate-poster.jpeg" alt="پوستر معرفی دکتر علی شیخ محمدی"/><div className="paper-columns">ارومیه برای عبور از چالش‌های امروز، به تصمیم‌های روشن، قابل اندازه‌گیری و مبتنی بر دانش نیاز دارد. شورای شهر باید خانه گفت‌وگوی شهروندان، متخصصان و مدیران اجرایی باشد. این شماره به معرفی اولویت‌های شهر، تجربه‌های مدیریتی و راه‌های مشارکت مردم اختصاص دارد.</div></div></div>}
    </main>
  );
}
