"use client";

import {
  AndroidLogo,
  AppleLogo,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Brain,
  Buildings,
  CalendarDots,
  Camera,
  ChartBar,
  Check,
  CheckCircle,
  Clock,
  Cpu,
  Desktop,
  DeviceMobile,
  DownloadSimple,
  Export,
  FilePdf,
  GraduationCap,
  HardDrives,
  House,
  Lightning,
  List,
  Megaphone,
  Package,
  Plus,
  Receipt,
  ShieldCheck,
  Sparkle,
  Target,
  Trash,
  TrendUp,
  UserPlus,
  UsersThree,
  Wallet,
  WifiHigh,
  WifiSlash,
  WindowsLogo,
  X,
} from "@phosphor-icons/react";
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";

type View = "overview" | "clients" | "finance" | "content" | "strategy" | "install";
type Modal = "lead" | "finance" | "content" | null;
type LeadStatus = "جدید" | "مذاکره" | "پیشنهاد ارسال‌شده" | "برنده";
type FinanceType = "income" | "expense";

type Lead = {
  id: string;
  name: string;
  company: string;
  service: string;
  value: number;
  status: LeadStatus;
  nextAction: string;
  date: string;
};

type FinanceItem = {
  id: string;
  type: FinanceType;
  title: string;
  amount: number;
  date: string;
};

type ContentItem = {
  id: string;
  title: string;
  channel: string;
  status: "ایده" | "در حال تولید" | "آماده انتشار" | "منتشرشده";
  date: string;
};

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const STORAGE_KEY = "bhb-business-os-v3";

const initialLeads: Lead[] = [
  {
    id: "lead-1",
    name: "مهندس نادری",
    company: "دفتر فنی آریا سازه",
    service: "محتوای تخصصی ماهانه",
    value: 28,
    status: "مذاکره",
    nextAction: "ارسال نمونه کاروسل مبحث نهم",
    date: "۲۳ مرداد",
  },
  {
    id: "lead-2",
    name: "دکتر رضایی",
    company: "مرکز آموزش عمران",
    service: "کارگاه AI برای مهندسان",
    value: 42,
    status: "پیشنهاد ارسال‌شده",
    nextAction: "پیگیری ظرفیت و تاریخ کارگاه",
    date: "۲۵ مرداد",
  },
  {
    id: "lead-3",
    name: "مهندس کریمی",
    company: "پروژه مسکونی آفتاب",
    service: "سامانه مستندسازی پروژه",
    value: 18,
    status: "جدید",
    nextAction: "جلسه معرفی نسخه آزمایشی",
    date: "۲۷ مرداد",
  },
  {
    id: "lead-4",
    name: "گروه پژوهشی سازه",
    company: "دانشگاه آزاد اسلامی",
    service: "کیت پایش سلامت سازه",
    value: 65,
    status: "برنده",
    nextAction: "آماده‌سازی برنامه تحویل",
    date: "۳۰ مرداد",
  },
];

const initialFinance: FinanceItem[] = [
  { id: "fin-1", type: "income", title: "پیش‌پرداخت کیت آموزشی", amount: 24, date: "۲۰ مرداد" },
  { id: "fin-2", type: "income", title: "طراحی بسته محتوایی", amount: 12, date: "۱۷ مرداد" },
  { id: "fin-3", type: "expense", title: "خرید حسگر و قطعات", amount: 7.5, date: "۱۸ مرداد" },
  { id: "fin-4", type: "expense", title: "دامنه و ابزارهای نرم‌افزاری", amount: 2.8, date: "۱۵ مرداد" },
];

const initialContent: ContentItem[] = [
  { id: "content-1", title: "۵ خطای پرهزینه در اجرای سازه بتنی", channel: "اینستاگرام", status: "آماده انتشار", date: "۲۲ مرداد" },
  { id: "content-2", title: "هوش مصنوعی چطور گزارش نظارت را سریع‌تر می‌کند؟", channel: "لینکدین", status: "در حال تولید", date: "۲۴ مرداد" },
  { id: "content-3", title: "آزمایش ارتعاش آزاد خرپای رومیزی", channel: "ویدئوی آموزشی", status: "ایده", date: "۲۷ مرداد" },
  { id: "content-4", title: "معرفی مسیر ۳۰ روزه BHB", channel: "تلگرام", status: "منتشرشده", date: "۱۹ مرداد" },
];

const businessPaths = [
  {
    id: 1,
    label: "درآمد سریع",
    title: "استودیوی محتوای مهندسی",
    description: "تولید محتوای علمی و تجاری برای دفاتر، مدرسان و شرکت‌های ساختمانی.",
    income: "۲۰–۵۰ میلیون / ماه",
    time: "شروع در ۷ روز",
    icon: Megaphone,
  },
  {
    id: 2,
    label: "اعتبار و مقیاس",
    title: "آکادمی AI و عمران",
    description: "کارگاه‌های پروژه‌محور هوش مصنوعی، MATLAB، FEM و پایش سازه.",
    income: "۳۵–۹۰ میلیون / دوره",
    time: "شروع در ۱۴ روز",
    icon: GraduationCap,
  },
  {
    id: 3,
    label: "درآمد اشتراکی",
    title: "مستندسازی هوشمند پروژه",
    description: "ثبت عکس، نقص، مکاتبه و گزارش‌های حرفه‌ای برای ناظران و دفاتر فنی.",
    income: "اشتراک هر پروژه",
    time: "نمونه در ۲۱ روز",
    icon: Buildings,
  },
  {
    id: 4,
    label: "محصول دیجیتال",
    title: "مهندسی‌یار آفلاین AI",
    description: "چک‌لیست، محاسبات، کنترل گزارش و قالب‌های آماده در یک ابزار فارسی.",
    income: "مجوز + به‌روزرسانی",
    time: "نسخه اول در ۴۵ روز",
    icon: Cpu,
  },
  {
    id: 5,
    label: "مزیت بلندمدت",
    title: "کیت پایش سلامت سازه",
    description: "Arduino، حسگر، مدل خرپا و تحلیل MATLAB برای آموزش و پژوهش.",
    income: "فروش کیت + آموزش",
    time: "نمونه در ۶۰ روز",
    icon: Lightning,
  },
];

const roadmap = [
  { title: "پیشنهاد ارزش", detail: "بازار هدف، خدمت مشخص و سه نمونه حرفه‌ای", day: "روز ۱–۷" },
  { title: "اعتبارسنجی بازار", detail: "۲۰ مخاطب، ۱۰ گفت‌وگو و ۵ پیشنهاد شخصی", day: "روز ۸–۱۴" },
  { title: "اولین فروش", detail: "سه سفارش پولی و ساخت نمونه موردی", day: "روز ۱۵–۲۱" },
  { title: "سیستم‌سازی", detail: "کارگاه ۱۵ نفره و فهرست انتظار نرم‌افزار", day: "روز ۲۲–۳۰" },
];

const navItems: Array<{ id: View; label: string; icon: typeof House }> = [
  { id: "overview", label: "مرکز فرمان", icon: House },
  { id: "clients", label: "مشتریان", icon: UsersThree },
  { id: "finance", label: "مالی", icon: Wallet },
  { id: "content", label: "استودیو محتوا", icon: Megaphone },
  { id: "strategy", label: "نقشه رشد", icon: Target },
  { id: "install", label: "نسخه آفلاین", icon: DownloadSimple },
];

const formatNumber = (value: number) => new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(value);
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function Home() {
  const [view, setView] = useState<View>("overview");
  const [modal, setModal] = useState<Modal>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [finance, setFinance] = useState<FinanceItem[]>(initialFinance);
  const [content, setContent] = useState<ContentItem[]>(initialContent);
  const [selectedPath, setSelectedPath] = useState(1);
  const [roadmapDone, setRoadmapDone] = useState<number[]>([0]);
  const [isOnline, setIsOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.leads)) setLeads(parsed.leads);
          if (Array.isArray(parsed.finance)) setFinance(parsed.finance);
          if (Array.isArray(parsed.content)) setContent(parsed.content);
          if (Array.isArray(parsed.roadmapDone)) setRoadmapDone(parsed.roadmapDone);
          if (typeof parsed.selectedPath === "number") setSelectedPath(parsed.selectedPath);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      setIsOnline(window.navigator.onLine);
    }, 0);

    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    window.addEventListener("beforeinstallprompt", beforeInstall);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
      window.removeEventListener("beforeinstallprompt", beforeInstall);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ leads, finance, content, roadmapDone, selectedPath }),
      );
    }, 120);
    return () => window.clearTimeout(timer);
  }, [leads, finance, content, roadmapDone, selectedPath]);

  const income = useMemo(
    () => finance.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0),
    [finance],
  );
  const expense = useMemo(
    () => finance.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0),
    [finance],
  );
  const pipeline = useMemo(
    () => leads.filter((lead) => lead.status !== "برنده").reduce((sum, lead) => sum + lead.value, 0),
    [leads],
  );
  const selected = businessPaths.find((path) => path.id === selectedPath) ?? businessPaths[0];

  const go = (target: View) => {
    setView(target);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const flashSaved = () => {
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 1800);
  };

  const addLead = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setLeads((items) => [
      {
        id: makeId("lead"),
        name: String(data.get("name")),
        company: String(data.get("company")),
        service: String(data.get("service")),
        value: Number(data.get("value")) || 0,
        status: String(data.get("status")) as LeadStatus,
        nextAction: String(data.get("nextAction")),
        date: String(data.get("date")),
      },
      ...items,
    ]);
    setModal(null);
    flashSaved();
  };

  const addFinance = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setFinance((items) => [
      {
        id: makeId("finance"),
        type: String(data.get("type")) as FinanceType,
        title: String(data.get("title")),
        amount: Number(data.get("amount")) || 0,
        date: String(data.get("date")),
      },
      ...items,
    ]);
    setModal(null);
    flashSaved();
  };

  const addContent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setContent((items) => [
      {
        id: makeId("content"),
        title: String(data.get("title")),
        channel: String(data.get("channel")),
        status: String(data.get("status")) as ContentItem["status"],
        date: String(data.get("date")),
      },
      ...items,
    ]);
    setModal(null);
    flashSaved();
  };

  const exportData = () => {
    const blob = new Blob(
      [JSON.stringify({ leads, finance, content, roadmapDone, selectedPath }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "BHB-Business-Backup.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const installApp = async () => {
    if (!installPrompt) {
      go("install");
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  };

  return (
    <div className="business-os">
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="بستن منو">
          <X size={20} />
        </button>
        <button className="brand-lockup" onClick={() => go("overview")}>
          <span className="brand-emblem">BHB</span>
          <span>
            <strong>آزمایشگاه سازه هوشمند</strong>
            <small>BUSINESS OPERATING SYSTEM</small>
          </span>
        </button>

        <div className="workspace-label">فضای کاری</div>
        <nav className="side-nav" aria-label="ناوبری برنامه">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={view === item.id ? "active" : ""}
                onClick={() => go(item.id)}
              >
                <Icon size={20} weight={view === item.id ? "fill" : "regular"} />
                <span>{item.label}</span>
                {item.id === "clients" && <b>{leads.length}</b>}
              </button>
            );
          })}
        </nav>

        <div className="side-growth">
          <span className="tiny-label">هدف ماه اول</span>
          <div className="growth-value">
            <strong>۳ مشتری پولی</strong>
            <span>{Math.min(100, Math.round((leads.filter((lead) => lead.status === "برنده").length / 3) * 100))}٪</span>
          </div>
          <div className="mini-progress">
            <i style={{ width: `${Math.min(100, (leads.filter((lead) => lead.status === "برنده").length / 3) * 100)}%` }} />
          </div>
          <small>تمرکز: فروش خدمت قبل از توسعه محصول</small>
        </div>

        <div className="side-profile">
          <span className="avatar">ی‌ب</span>
          <span>
            <strong>یوسف بهرام‌بیگی</strong>
            <small>بنیان‌گذار و مهندس سازه</small>
          </span>
          <ShieldCheck size={20} color="#b7df45" />
        </div>
      </aside>

      {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="بستن منو" />}

      <div className="app-shell">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileNav(true)} aria-label="باز کردن منو">
            <List size={22} />
          </button>
          <div className="top-title">
            <span>{navItems.find((item) => item.id === view)?.label}</span>
            <small>مرداد ۱۴۰۵ • نسخه حرفه‌ای ۳.۰</small>
          </div>
          <div className="top-actions">
            <span className={`network-pill ${isOnline ? "online" : "offline"}`}>
              {isOnline ? <WifiHigh size={16} /> : <WifiSlash size={16} />}
              {isOnline ? "آنلاین و همگام" : "حالت آفلاین"}
            </span>
            <button className="icon-button" aria-label="اعلان‌ها"><Bell size={20} /><i /></button>
            <button className="install-small" onClick={installApp}>
              <DownloadSimple size={18} /> نصب برنامه
            </button>
          </div>
        </header>

        <main className="main-canvas">
          {view === "overview" && (
            <Overview
              leads={leads}
              income={income}
              expense={expense}
              pipeline={pipeline}
              content={content}
              onGo={go}
              onAddLead={() => setModal("lead")}
              onInstall={installApp}
            />
          )}

          {view === "clients" && (
            <Clients
              leads={leads}
              setLeads={setLeads}
              onAdd={() => setModal("lead")}
            />
          )}

          {view === "finance" && (
            <Finance
              items={finance}
              income={income}
              expense={expense}
              pipeline={pipeline}
              setItems={setFinance}
              onAdd={() => setModal("finance")}
              onExport={exportData}
            />
          )}

          {view === "content" && (
            <ContentStudio
              items={content}
              setItems={setContent}
              selectedPath={selected.title}
              onAdd={() => setModal("content")}
            />
          )}

          {view === "strategy" && (
            <Strategy
              selectedPath={selectedPath}
              setSelectedPath={setSelectedPath}
              roadmapDone={roadmapDone}
              setRoadmapDone={setRoadmapDone}
            />
          )}

          {view === "install" && (
            <InstallCenter
              canInstall={Boolean(installPrompt)}
              isOnline={isOnline}
              onInstall={installApp}
              onExport={exportData}
            />
          )}
        </main>
      </div>

      {modal === "lead" && <LeadModal onClose={() => setModal(null)} onSubmit={addLead} />}
      {modal === "finance" && <FinanceModal onClose={() => setModal(null)} onSubmit={addFinance} />}
      {modal === "content" && <ContentModal onClose={() => setModal(null)} onSubmit={addContent} />}
      {savedNotice && <div className="saved-toast"><CheckCircle size={20} weight="fill" /> اطلاعات با موفقیت ذخیره شد</div>}
    </div>
  );
}

function Overview({
  leads,
  income,
  expense,
  pipeline,
  content,
  onGo,
  onAddLead,
  onInstall,
}: {
  leads: Lead[];
  income: number;
  expense: number;
  pipeline: number;
  content: ContentItem[];
  onGo: (view: View) => void;
  onAddLead: () => void;
  onInstall: () => void;
}) {
  const wins = leads.filter((lead) => lead.status === "برنده").length;
  const published = content.filter((item) => item.status === "منتشرشده").length;
  return (
    <div className="view-stack">
      <section className="command-hero">
        <div className="hero-content">
          <span className="hero-kicker"><Sparkle size={17} weight="fill" /> موتور رشد کسب‌وکار مهندسی تو</span>
          <h1>تخصصت را مدیریت کن؛<br /><em>درآمدت را مهندسی کن.</em></h1>
          <p>از جذب اولین مشتری تا ساخت یک محصول مقیاس‌پذیر—همه تصمیم‌ها، اعداد و اقدام‌های مهم در یک مرکز فرمان هوشمند.</p>
          <div className="hero-buttons">
            <button className="lime-button" onClick={onAddLead}><UserPlus size={19} /> افزودن مشتری جدید</button>
            <button className="glass-button" onClick={() => onGo("strategy")}><Target size={19} /> مشاهده نقشه رشد</button>
          </div>
        </div>
        <div className="hero-visual" aria-label="نمای رشد کسب‌وکار">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="twin-core">
            <Buildings size={70} weight="duotone" />
            <span>SMART<br />STRUCTURE</span>
          </div>
          <div className="float-chip chip-a"><Brain size={18} /> هوش مصنوعی</div>
          <div className="float-chip chip-b"><ChartBar size={18} /> رشد پایدار</div>
          <div className="float-chip chip-c"><ShieldCheck size={18} /> اعتبار حرفه‌ای</div>
        </div>
      </section>

      <section className="kpi-grid">
        <MetricCard icon={<Wallet size={22} />} label="درآمد ثبت‌شده" value={`${formatNumber(income)} م`} meta={`خالص ${formatNumber(income - expense)} میلیون`} accent="lime" />
        <MetricCard icon={<TrendUp size={22} />} label="ارزش فرصت‌های باز" value={`${formatNumber(pipeline)} م`} meta={`${leads.length - wins} مذاکره فعال`} accent="teal" />
        <MetricCard icon={<CheckCircle size={22} />} label="مشتری قطعی" value={formatNumber(wins)} meta="هدف ماه اول: ۳ مشتری" accent="gold" />
        <MetricCard icon={<Megaphone size={22} />} label="محتوای منتشرشده" value={formatNumber(published)} meta={`${content.length - published} محتوا در صف تولید`} accent="blue" />
      </section>

      <section className="dashboard-grid">
        <div className="surface pipeline-panel">
          <PanelHeader eyebrow="قیف فروش" title="فرصت‌های نزدیک به درآمد" action="همه مشتریان" onAction={() => onGo("clients")} />
          <div className="lead-list compact">
            {leads.slice(0, 4).map((lead) => <LeadRow key={lead.id} lead={lead} />)}
          </div>
        </div>

        <div className="surface week-panel">
          <PanelHeader eyebrow="تمرکز این هفته" title="سه اقدام با بیشترین اثر" />
          <div className="focus-actions">
            <FocusAction number="۰۱" title="ارسال ۵ پیشنهاد شخصی" note="تا پایان چهارشنبه" done />
            <FocusAction number="۰۲" title="ضبط ویدئوی معرفی ۶۰ ثانیه‌ای" note="برای لینکدین و اینستاگرام" />
            <FocusAction number="۰۳" title="تکمیل نسخه نمایشی گزارش هوشمند" note="آماده ارائه به ۳ ناظر" />
          </div>
        </div>
      </section>

      <section className="action-strip">
        <div>
          <span className="pulse-live" />
          <p><strong>برنامه روی این دستگاه ذخیره می‌شود.</strong><small>بدون اینترنت هم مشتریان، مالی و برنامه محتوا در دسترس هستند.</small></p>
        </div>
        <button onClick={onInstall}><DownloadSimple size={19} /> نصب نسخه آفلاین</button>
      </section>
    </div>
  );
}

function Clients({ leads, setLeads, onAdd }: { leads: Lead[]; setLeads: (value: Lead[] | ((items: Lead[]) => Lead[])) => void; onAdd: () => void }) {
  const statuses: LeadStatus[] = ["جدید", "مذاکره", "پیشنهاد ارسال‌شده", "برنده"];
  return (
    <div className="view-stack">
      <ViewHeader icon={<UsersThree size={25} />} eyebrow="CRM مهندسی" title="مشتریان و فرصت‌های فروش" description="تمام ارتباط‌ها، اقدام بعدی و ارزش هر فرصت را بدون پراکندگی مدیریت کن." action="افزودن مشتری" onAction={onAdd} />
      <section className="crm-summary">
        {statuses.map((status) => {
          const items = leads.filter((lead) => lead.status === status);
          return <div key={status}><span>{status}</span><strong>{formatNumber(items.length)}</strong><small>{formatNumber(items.reduce((sum, lead) => sum + lead.value, 0))} میلیون تومان</small></div>;
        })}
      </section>
      <section className="surface data-panel">
        <div className="table-head"><span>مشتری / مجموعه</span><span>خدمت پیشنهادی</span><span>ارزش</span><span>مرحله</span><span>اقدام بعدی</span><span /></div>
        <div className="table-body">
          {leads.map((lead) => (
            <div className="table-row" key={lead.id}>
              <div className="client-cell"><span>{lead.name.slice(0, 1)}</span><p><strong>{lead.name}</strong><small>{lead.company}</small></p></div>
              <span>{lead.service}</span>
              <strong>{formatNumber(lead.value)} م</strong>
              <select value={lead.status} onChange={(event) => setLeads((items) => items.map((item) => item.id === lead.id ? { ...item, status: event.target.value as LeadStatus } : item))}>
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
              <p className="next-cell"><span>{lead.nextAction}</span><small><CalendarDots size={13} /> {lead.date}</small></p>
              <button className="delete-button" onClick={() => setLeads((items) => items.filter((item) => item.id !== lead.id))} aria-label={`حذف ${lead.name}`}><Trash size={17} /></button>
            </div>
          ))}
          {!leads.length && <EmptyState icon={<UsersThree size={35} />} text="هنوز مشتری ثبت نشده است." action="اولین مشتری را اضافه کن" onAction={onAdd} />}
        </div>
      </section>
    </div>
  );
}

function Finance({ items, income, expense, pipeline, setItems, onAdd, onExport }: { items: FinanceItem[]; income: number; expense: number; pipeline: number; setItems: (value: FinanceItem[] | ((items: FinanceItem[]) => FinanceItem[])) => void; onAdd: () => void; onExport: () => void }) {
  const max = Math.max(income, expense, pipeline, 1);
  return (
    <div className="view-stack">
      <ViewHeader icon={<Wallet size={25} />} eyebrow="کنترل مالی" title="درآمد، هزینه و سود واقعی" description="اعداد را ساده و شفاف ببین تا تصمیم‌های تجاری بر حدس و احساس متکی نباشند." action="ثبت تراکنش" onAction={onAdd} secondary="خروجی پشتیبان" onSecondary={onExport} />
      <section className="finance-hero">
        <div className="finance-total"><span>سود خالص ثبت‌شده</span><strong>{formatNumber(income - expense)} <small>میلیون تومان</small></strong><p><TrendUp size={17} /> نسبت درآمد به هزینه: {formatNumber(expense ? income / expense : income)} برابر</p></div>
        <div className="bar-visual" aria-label="مقایسه مالی">
          <FinanceBar label="درآمد" value={income} max={max} tone="lime" />
          <FinanceBar label="هزینه" value={expense} max={max} tone="coral" />
          <FinanceBar label="فروش بالقوه" value={pipeline} max={max} tone="teal" />
        </div>
      </section>
      <section className="surface finance-list">
        <PanelHeader eyebrow="دفتر مالی" title="آخرین تراکنش‌ها" />
        {items.map((item) => (
          <div className="finance-row" key={item.id}>
            <span className={`finance-icon ${item.type}`}><Receipt size={19} /></span>
            <p><strong>{item.title}</strong><small>{item.date}</small></p>
            <strong className={item.type}>{item.type === "income" ? "+" : "−"}{formatNumber(item.amount)} میلیون</strong>
            <button className="delete-button" onClick={() => setItems((rows) => rows.filter((row) => row.id !== item.id))} aria-label={`حذف ${item.title}`}><Trash size={17} /></button>
          </div>
        ))}
      </section>
    </div>
  );
}

function ContentStudio({ items, setItems, selectedPath, onAdd }: { items: ContentItem[]; setItems: (value: ContentItem[] | ((items: ContentItem[]) => ContentItem[])) => void; selectedPath: string; onAdd: () => void }) {
  const [promptCopied, setPromptCopied] = useState(false);
  const prompt = `برای برند «آزمایشگاه سازه هوشمند BHB» یک محتوای حرفه‌ای درباره ${selectedPath} بنویس. مخاطب مهندسان عمران است. ساختار: هوک، مسئله واقعی، سه نکته کاربردی، دعوت به اقدام. لحن علمی، روشن و قابل اعتماد باشد.`;
  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setPromptCopied(true);
    window.setTimeout(() => setPromptCopied(false), 1600);
  };
  return (
    <div className="view-stack">
      <ViewHeader icon={<Megaphone size={25} />} eyebrow="استودیوی برند" title="محتوا؛ موتور اعتبار و فروش" description="ایده‌ها را به یک جریان منظم از محتوای علمی، قابل‌اعتماد و مشتری‌ساز تبدیل کن." action="ایده جدید" onAction={onAdd} />
      <section className="content-layout">
        <div className="surface editorial-board">
          <PanelHeader eyebrow="تقویم محتوا" title="صف تولید این ماه" />
          {items.map((item) => (
            <div className="content-row" key={item.id}>
              <span className="content-thumb"><Camera size={21} /></span>
              <p><strong>{item.title}</strong><small>{item.channel} • {item.date}</small></p>
              <select value={item.status} onChange={(event) => setItems((rows) => rows.map((row) => row.id === item.id ? { ...row, status: event.target.value as ContentItem["status"] } : row))}>
                {(["ایده", "در حال تولید", "آماده انتشار", "منتشرشده"] as const).map((status) => <option key={status}>{status}</option>)}
              </select>
              <button className="delete-button" onClick={() => setItems((rows) => rows.filter((row) => row.id !== item.id))} aria-label={`حذف ${item.title}`}><Trash size={17} /></button>
            </div>
          ))}
        </div>
        <aside className="ai-copy-card">
          <span className="ai-mark"><Brain size={28} weight="duotone" /></span>
          <span className="tiny-label">دستیار محتوای AI</span>
          <h3>پرامپت آماده برای مسیر منتخب</h3>
          <p>{prompt}</p>
          <button onClick={copyPrompt}>{promptCopied ? <Check size={18} /> : <Sparkle size={18} />}{promptCopied ? "کپی شد" : "کپی پرامپت"}</button>
          <small>پیشنهاد محتوا جایگزین بازبینی تخصصی مهندس نیست.</small>
        </aside>
      </section>
      <section className="poster-callout">
        {/* The downloadable campaign asset is intentionally rendered as a native image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div><img className="poster-thumb" src="/assets/bhb-smart-structure-poster.png" alt="پوستر رسمی آزمایشگاه سازه هوشمند BHB" width="72" height="90" /><span><FilePdf size={22} /></span><p><strong>پوستر رسمی معرفی BHB</strong><small>نسخه عمودی ۴:۵ برای شبکه‌های اجتماعی و معرفی حرفه‌ای</small></p></div>
        <a href="/assets/bhb-smart-structure-poster.png" download><DownloadSimple size={18} /> دانلود پوستر</a>
      </section>
    </div>
  );
}

function Strategy({ selectedPath, setSelectedPath, roadmapDone, setRoadmapDone }: { selectedPath: number; setSelectedPath: (value: number) => void; roadmapDone: number[]; setRoadmapDone: (value: number[] | ((items: number[]) => number[])) => void }) {
  return (
    <div className="view-stack">
      <ViewHeader icon={<Target size={25} />} eyebrow="استراتژی درآمد" title="از خدمت سریع تا محصول مقیاس‌پذیر" description="فقط یک مسیر اصلی را برای ۳۰ روز انتخاب کن؛ سپس از داده واقعی بازار برای مرحله بعد تصمیم بگیر." />
      <section className="path-selector">
        {businessPaths.map((path) => {
          const Icon = path.icon;
          return (
            <button key={path.id} className={selectedPath === path.id ? "active" : ""} onClick={() => setSelectedPath(path.id)}>
              <span><Icon size={24} weight="duotone" /></span>
              <small>{path.label}</small>
              <strong>{path.title}</strong>
              <p>{path.description}</p>
              <div><em>{path.income}</em><i>{path.time}</i></div>
              <b>{selectedPath === path.id ? <CheckCircle size={20} weight="fill" /> : <ArrowLeft size={18} />}</b>
            </button>
          );
        })}
      </section>
      <section className="roadmap-pro">
        <div className="roadmap-title"><span className="tiny-label">برنامه ۳۰ روزه مسیر منتخب</span><h3>{businessPaths.find((path) => path.id === selectedPath)?.title}</h3><p>{roadmapDone.length} مرحله از ۴ مرحله تکمیل شده است.</p></div>
        <div className="roadmap-track">
          {roadmap.map((step, index) => {
            const done = roadmapDone.includes(index);
            return (
              <button key={step.title} className={done ? "done" : ""} onClick={() => setRoadmapDone((items) => done ? items.filter((item) => item !== index) : [...items, index])}>
                <span>{done ? <Check size={18} /> : `۰${index + 1}`}</span>
                <small>{step.day}</small>
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
              </button>
            );
          })}
        </div>
      </section>
      <section className="three-phase">
        <div><span>فاز ۱</span><strong>خدمت تخصصی</strong><small>نقدینگی و شناخت مسئله واقعی</small></div><ArrowLeft size={22} />
        <div><span>فاز ۲</span><strong>آموزش و جامعه</strong><small>اعتماد، اعتبار و مخاطب وفادار</small></div><ArrowLeft size={22} />
        <div><span>فاز ۳</span><strong>محصول دیجیتال</strong><small>درآمد تکرارشونده و مقیاس‌پذیر</small></div>
      </section>
    </div>
  );
}

function InstallCenter({ canInstall, isOnline, onInstall, onExport }: { canInstall: boolean; isOnline: boolean; onInstall: () => void; onExport: () => void }) {
  const platforms = [
    { icon: WindowsLogo, name: "Windows", detail: "در Edge یا Chrome گزینه Install را بزنید.", action: "نصب به‌صورت PWA" },
    { icon: AndroidLogo, name: "Android", detail: "از منوی Chrome گزینه Add to Home screen را انتخاب کنید.", action: "افزودن به صفحه اصلی" },
    { icon: AppleLogo, name: "iPhone / iPad", detail: "در Safari، Share و سپس Add to Home Screen را بزنید.", action: "راهنمای نصب iOS" },
    { icon: Desktop, name: "macOS / Linux", detail: "در مرورگرهای Chromium برنامه را مثل یک نرم‌افزار مستقل نصب کنید.", action: "نصب نسخه دسکتاپ" },
  ];
  return (
    <div className="view-stack">
      <ViewHeader icon={<DownloadSimple size={25} />} eyebrow="همیشه در دسترس" title="یک برنامه؛ روی همه دستگاه‌ها" description="اطلاعات روی دستگاه ذخیره می‌شوند و پس از اولین بارگذاری، برنامه بدون اینترنت هم کار می‌کند." />
      <section className="install-hero">
        <div>
          <span className="status-big">{isOnline ? <WifiHigh size={28} /> : <WifiSlash size={28} />} {isOnline ? "آماده ذخیره آفلاین" : "اکنون آفلاین هستید"}</span>
          <h2>کسب‌وکارت را همیشه همراه داشته باش.</h2>
          <p>نسخه PWA بدون فروشگاه نرم‌افزاری روی ویندوز، اندروید، آیفون، مک و لینوکس نصب می‌شود؛ سریع، خصوصی و مستقل.</p>
          <div><button className="lime-button" onClick={onInstall}><DownloadSimple size={19} /> {canInstall ? "نصب همین حالا" : "مشاهده روش نصب"}</button><button className="glass-button dark" onClick={onExport}><Export size={19} /> پشتیبان‌گیری اطلاعات</button></div>
        </div>
        <div className="device-cluster"><DeviceMobile size={112} weight="duotone" /><Desktop size={150} weight="duotone" /><span><Package size={28} /> PWA</span></div>
      </section>
      <section className="platform-grid">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return <article key={platform.name}><span><Icon size={30} weight="duotone" /></span><h3>{platform.name}</h3><p>{platform.detail}</p><button onClick={onInstall}>{platform.action}<ArrowLeft size={16} /></button></article>;
        })}
      </section>
      <section className="offline-features">
        <div><HardDrives size={25} /><p><strong>ذخیره محلی و خصوصی</strong><small>اطلاعات مشتری و مالی از دستگاه خارج نمی‌شود.</small></p></div>
        <div><ShieldCheck size={25} /><p><strong>پشتیبان قابل‌انتقال</strong><small>هر زمان یک فایل JSON از داده‌ها دریافت کن.</small></p></div>
        <div><Lightning size={25} /><p><strong>راه‌اندازی سریع</strong><small>بدون نیاز به حساب کاربری یا نصب پیچیده.</small></p></div>
      </section>
    </div>
  );
}

function MetricCard({ icon, label, value, meta, accent }: { icon: ReactNode; label: string; value: string; meta: string; accent: string }) {
  return <article className={`metric-card ${accent}`}><span>{icon}</span><p><small>{label}</small><strong>{value}</strong><em>{meta}</em></p><ArrowUpRight size={18} /></article>;
}

function PanelHeader({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="panel-header"><div><span>{eyebrow}</span><h3>{title}</h3></div>{action && <button onClick={onAction}>{action}<ArrowLeft size={16} /></button>}</div>;
}

function LeadRow({ lead }: { lead: Lead }) {
  return <div className="lead-row"><span className="lead-avatar">{lead.name.slice(0, 1)}</span><p><strong>{lead.name}</strong><small>{lead.service}</small></p><span className="lead-status">{lead.status}</span><strong>{formatNumber(lead.value)} م</strong></div>;
}

function FocusAction({ number, title, note, done = false }: { number: string; title: string; note: string; done?: boolean }) {
  return <div className={done ? "done" : ""}><span>{done ? <Check size={16} /> : number}</span><p><strong>{title}</strong><small>{note}</small></p><Clock size={17} /></div>;
}

function ViewHeader({ icon, eyebrow, title, description, action, onAction, secondary, onSecondary }: { icon: ReactNode; eyebrow: string; title: string; description: string; action?: string; onAction?: () => void; secondary?: string; onSecondary?: () => void }) {
  return <header className="view-header"><div className="view-heading"><span className="view-icon">{icon}</span><div><small>{eyebrow}</small><h1>{title}</h1><p>{description}</p></div></div><div className="view-actions">{secondary && <button className="secondary-action" onClick={onSecondary}><Export size={18} />{secondary}</button>}{action && <button className="primary-action" onClick={onAction}><Plus size={18} />{action}</button>}</div></header>;
}

function FinanceBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  return <div><span>{label}</span><div className="bar-rail"><i className={tone} style={{ width: `${Math.max(5, (value / max) * 100)}%` }} /></div><strong>{formatNumber(value)} م</strong></div>;
}

function EmptyState({ icon, text, action, onAction }: { icon: ReactNode; text: string; action: string; onAction: () => void }) {
  return <div className="empty-state">{icon}<p>{text}</p><button onClick={onAction}><Plus size={17} />{action}</button></div>;
}

function ModalShell({ title, subtitle, icon, onClose, children }: { title: string; subtitle: string; icon: ReactNode; onClose: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal-card"><button className="modal-close" onClick={onClose} aria-label="بستن"><X size={20} /></button><div className="modal-heading"><span>{icon}</span><div><h2>{title}</h2><p>{subtitle}</p></div></div>{children}</div></div>;
}

function FormField({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return <label className={wide ? "wide" : ""}><span>{label}</span>{children}</label>;
}

function LeadModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <ModalShell title="مشتری جدید" subtitle="یک فرصت واقعی را به مسیر فروش اضافه کن." icon={<UserPlus size={26} />} onClose={onClose}><form className="smart-form" onSubmit={onSubmit}><FormField label="نام مخاطب"><input name="name" required placeholder="مثلاً مهندس احمدی" /></FormField><FormField label="مجموعه / شرکت"><input name="company" required placeholder="نام دفتر یا سازمان" /></FormField><FormField label="خدمت موردنظر" wide><input name="service" required placeholder="مثلاً بسته محتوای تخصصی" /></FormField><FormField label="ارزش تقریبی (میلیون تومان)"><input name="value" type="number" min="0" step="0.5" required placeholder="۲۵" /></FormField><FormField label="مرحله فروش"><select name="status"><option>جدید</option><option>مذاکره</option><option>پیشنهاد ارسال‌شده</option><option>برنده</option></select></FormField><FormField label="اقدام بعدی" wide><input name="nextAction" required placeholder="کاری که باید بعد انجام شود" /></FormField><FormField label="تاریخ پیگیری"><input name="date" required placeholder="مثلاً ۲۵ مرداد" /></FormField><button className="submit-button" type="submit">ذخیره مشتری<ArrowLeft size={18} /></button></form></ModalShell>;
}

function FinanceModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <ModalShell title="ثبت تراکنش" subtitle="درآمد و هزینه را شفاف و به‌روز نگه دار." icon={<Wallet size={26} />} onClose={onClose}><form className="smart-form" onSubmit={onSubmit}><FormField label="نوع تراکنش"><select name="type"><option value="income">درآمد</option><option value="expense">هزینه</option></select></FormField><FormField label="مبلغ (میلیون تومان)"><input name="amount" type="number" min="0" step="0.1" required placeholder="۱۲.۵" /></FormField><FormField label="عنوان" wide><input name="title" required placeholder="مثلاً پیش‌پرداخت طراحی محتوا" /></FormField><FormField label="تاریخ"><input name="date" required placeholder="مثلاً ۲۲ مرداد" /></FormField><button className="submit-button" type="submit">ثبت تراکنش<ArrowLeft size={18} /></button></form></ModalShell>;
}

function ContentModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <ModalShell title="ایده محتوای جدید" subtitle="هر ایده را به یک اقدام زمان‌بندی‌شده تبدیل کن." icon={<Megaphone size={26} />} onClose={onClose}><form className="smart-form" onSubmit={onSubmit}><FormField label="عنوان محتوا" wide><input name="title" required placeholder="عنوان دقیق و جذاب محتوا" /></FormField><FormField label="کانال انتشار"><select name="channel"><option>اینستاگرام</option><option>لینکدین</option><option>تلگرام</option><option>ویدئوی آموزشی</option></select></FormField><FormField label="وضعیت"><select name="status"><option>ایده</option><option>در حال تولید</option><option>آماده انتشار</option><option>منتشرشده</option></select></FormField><FormField label="تاریخ"><input name="date" required placeholder="مثلاً ۲۷ مرداد" /></FormField><button className="submit-button" type="submit">افزودن به تقویم<ArrowLeft size={18} /></button></form></ModalShell>;
}
