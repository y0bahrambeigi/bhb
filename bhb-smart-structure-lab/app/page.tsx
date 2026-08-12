"use client";

import { type CSSProperties, useEffect, useState } from "react";

const businessPaths = [
  {
    id: 1,
    number: "۰۱",
    category: "fast",
    tag: "سریع‌ترین درآمد",
    title: "استودیوی محتوای تخصصی مهندسی",
    short: "محتوای فنی که واقعاً اعتبار می‌سازد.",
    description:
      "طراحی کاروسل، پوستر، ویدئوی کوتاه و کمپین محتوایی برای دفاتر مهندسی، شرکت‌های ساختمانی و مدرسان تخصصی.",
    revenue: "پروژه‌ای + قرارداد ماهانه",
    launch: "۷ روز",
    score: "تناسب ۹۵٪",
  },
  {
    id: 2,
    number: "۰۲",
    category: "scalable",
    tag: "اعتبار و مقیاس",
    title: "آکادمی هوش مصنوعی و عمران",
    short: "آموزش پروژه‌محور؛ نه دوره‌های تکراری.",
    description:
      "کارگاه‌های کاربردی AI، MATLAB، اجزای محدود، بهینه‌سازی خرپا و پایش سازه با خروجی واقعی برای هر دانشجو.",
    revenue: "دوره + منتورینگ + اشتراک",
    launch: "۱۴ روز",
    score: "تناسب ۹۲٪",
  },
  {
    id: 3,
    number: "۰۳",
    category: "scalable",
    tag: "درآمد اشتراکی",
    title: "مستندسازی هوشمند پروژه",
    short: "از عکس کارگاه تا گزارش منظم و قابل پیگیری.",
    description:
      "چک‌لیست مرحله‌ای، آرشیو تصویر، ثبت نقص، پیش‌نویس مکاتبات و گزارش PDF برای مهندسان ناظر و دفاتر فنی.",
    revenue: "اشتراک پروژه یا دفتر",
    launch: "۲۱ روز",
    score: "تناسب ۹۰٪",
  },
  {
    id: 4,
    number: "۰۴",
    category: "product",
    tag: "محصول دیجیتال",
    title: "جعبه‌ابزار آفلاین مهندسی‌یار AI",
    short: "ابزارهای کوچک؛ ارزش بزرگ و تکرارشونده.",
    description:
      "کنترل اولیه گزارش، محاسبات سریع، قالب مکاتبات، چک‌لیست و تحلیل خرپا در یک محیط فارسی و آفلاین.",
    revenue: "فروش مجوز + به‌روزرسانی",
    launch: "۳۰ تا ۴۵ روز",
    score: "تناسب ۸۸٪",
  },
  {
    id: 5,
    number: "۰۵",
    category: "strategic",
    tag: "مزیت بلندمدت",
    title: "کیت آموزشی پایش سلامت سازه",
    short: "پیوند دانشگاه، حسگر و تحلیل سازه.",
    description:
      "مدل خرپا، Arduino، حسگر ارتعاش و کرنش، داشبورد MATLAB و آزمایش‌های آماده برای دانشگاه‌ها و مراکز آموزشی.",
    revenue: "فروش کیت + آموزش + سفارشی‌سازی",
    launch: "۶۰ روز",
    score: "تناسب ۹۳٪",
  },
];

const filters = [
  { id: "all", label: "همه مسیرها" },
  { id: "fast", label: "درآمد سریع" },
  { id: "scalable", label: "مقیاس‌پذیر" },
  { id: "product", label: "نرم‌افزاری" },
  { id: "strategic", label: "راهبردی" },
];

const roadmapWeeks = [
  {
    week: "هفته اول",
    title: "تمرکز و پیشنهاد ارزش",
    accent: "تعریف پایه",
    tasks: [
      "انتخاب بازار هدف اولیه",
      "تعریف یک خدمت مشخص و قابل قیمت‌گذاری",
      "طراحی سه نمونه حرفه‌ای",
      "آماده‌سازی معرفی یک‌صفحه‌ای برند",
    ],
  },
  {
    week: "هفته دوم",
    title: "گفت‌وگو با بازار",
    accent: "اعتبارسنجی",
    tasks: [
      "تهیه فهرست ۲۰ مخاطب واجد شرایط",
      "انجام ۱۰ گفت‌وگوی کوتاه مسئله‌محور",
      "ارسال پنج پیشنهاد همکاری شخصی‌سازی‌شده",
      "ثبت پرسش‌ها و اعتراض‌های پرتکرار",
    ],
  },
  {
    week: "هفته سوم",
    title: "اولین فروش واقعی",
    accent: "درآمد",
    tasks: [
      "بستن حداقل سه سفارش آزمایشی پولی",
      "تحویل سریع و استاندارد خدمات",
      "اندازه‌گیری زمان، هزینه و رضایت مشتری",
      "دریافت رضایت‌نامه یا نمونه موردی",
    ],
  },
  {
    week: "هفته چهارم",
    title: "تبدیل خدمت به سیستم",
    accent: "مقیاس",
    tasks: [
      "استانداردسازی فرایند تحویل",
      "پیش‌فروش اولین کارگاه ۱۵ نفره",
      "ساخت فهرست انتظار محصول نرم‌افزاری",
      "مرور شاخص‌ها و تعیین برنامه ۹۰ روزه",
    ],
  },
];

const pathActions: Record<number, { first: string; second: string; third: string }> = {
  1: {
    first: "سه نمونه در حوزه سازه و نظارت طراحی کن.",
    second: "به ۲۰ دفتر و مدرس تخصصی معرفی شخصی بفرست.",
    third: "سه قرارداد آزمایشی را به قرارداد ماهانه تبدیل کن.",
  },
  2: {
    first: "یک کارگاه چهارجلسه‌ای را قبل از ضبط پیش‌فروش کن.",
    second: "با ۱۲ تا ۱۵ هنرجو یک پروژه واقعی اجرا کن.",
    third: "ضبط دوره را به محصول آفلاین و منتورینگ تبدیل کن.",
  },
  3: {
    first: "فرایند گزارش‌سازی یک پروژه را دستی نمونه‌سازی کن.",
    second: "با سه مهندس ناظر زمان و کیفیت خروجی را بسنج.",
    third: "قابلیت‌های پرتقاضا را در یک وب‌اپ آفلاین بساز.",
  },
  4: {
    first: "فقط یک ماژول پول‌ساز، یعنی گزارش نظارت، انتخاب کن.",
    second: "نسخه آزمایشی را در اختیار ۱۰ مهندس قرار بده.",
    third: "پس از سه پیش‌خرید، توسعه محصول را ادامه بده.",
  },
  5: {
    first: "نمونه رومیزی خرپا و حسگر ارتعاش را تکمیل کن.",
    second: "سه آزمایش قابل تکرار و داشبورد MATLAB بساز.",
    third: "نمونه را به گروه‌های عمران و آموزشگاه‌ها ارائه کن.",
  },
};

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedPath, setSelectedPath] = useState(1);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem("bhb-roadmap-progress");
      if (saved) {
        try {
          setCompletedTasks(JSON.parse(saved));
        } catch {
          window.localStorage.removeItem("bhb-roadmap-progress");
        }
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const toggleTask = (taskId: string) => {
    setCompletedTasks((current) => {
      const next = current.includes(taskId)
        ? current.filter((item) => item !== taskId)
        : [...current, taskId];
      window.localStorage.setItem("bhb-roadmap-progress", JSON.stringify(next));
      return next;
    });
  };

  const choosePath = (pathId: number) => {
    setSelectedPath(pathId);
    window.setTimeout(() => {
      document.querySelector("#strategy")?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const filteredPaths =
    activeFilter === "all"
      ? businessPaths
      : businessPaths.filter((path) => path.category === activeFilter);
  const selected = businessPaths.find((path) => path.id === selectedPath)!;
  const totalTasks = roadmapWeeks.reduce((sum, week) => sum + week.tasks.length, 0);
  const progress = Math.round((completedTasks.length / totalTasks) * 100);
  const activeWeekIndex = Math.min(Math.floor(progress / 25), 3);
  const activeWeek = roadmapWeeks[activeWeekIndex];
  const ringStyle = { "--progress": `${progress * 3.6}deg` } as CSSProperties;

  return (
    <main>
      <header className="site-header" aria-label="ناوبری اصلی">
        <a className="brand" href="#top" aria-label="صفحه نخست BHB">
          <span className="brand-mark">BHB</span>
          <span className="brand-copy">
            <strong>آزمایشگاه سازه هوشمند</strong>
            <small>SMART STRUCTURE LAB</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="بخش‌های صفحه">
          <a href="#paths">مسیرهای درآمد</a>
          <a href="#roadmap">برنامه ۳۰ روزه</a>
          <a href="#strategy">استراتژی رشد</a>
        </nav>

        <a className="header-cta" href="#roadmap">
          شروع برنامه
          <span aria-hidden="true">←</span>
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="hero-copy">
          <div className="eyebrow">
            <span className="pulse-dot" />
            نقشه اختصاصی کسب‌وکار برای یوسف بهرام‌بیگی
          </div>
          <h1>
            از تخصص سازه،
            <span> یک کسب‌وکار هوشمند بساز.</span>
          </h1>
          <p>
            ترکیب مهندسی عمران، هوش مصنوعی، آموزش و طراحی؛ در یک مسیر روشن برای
            رسیدن به درآمد سریع و ساخت یک برند حرفه‌ای ماندگار.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#roadmap">
              برنامه ۳۰ روزه من
              <span aria-hidden="true">←</span>
            </a>
            <a className="text-button" href="#paths">
              کشف ۵ مسیر درآمد
              <span className="play-mark" aria-hidden="true">◀</span>
            </a>
          </div>

          <div className="hero-proof" aria-label="ویژگی‌های برنامه">
            <div>
              <strong>۵</strong>
              <span>مدل درآمدی</span>
            </div>
            <i />
            <div>
              <strong>۳۰</strong>
              <span>روز تا اعتبارسنجی</span>
            </div>
            <i />
            <div>
              <strong>۳</strong>
              <span>مشتری هدف اولیه</span>
            </div>
          </div>
        </div>

        <aside className="hero-dashboard" aria-label="خلاصه برنامه کسب‌وکار">
          <div className="dashboard-topline">
            <div>
              <small>وضعیت امروز</small>
              <strong>{progress ? "در حال اجرا" : "آماده شروع"}</strong>
            </div>
            <span className="live-badge">فعال</span>
          </div>

          <div className="focus-card">
            <div className="focus-label">
              <span>تمرکز فعلی</span>
              <small>هفته {activeWeekIndex + 1} از ۴</small>
            </div>
            <h2>{activeWeek.title}</h2>
            <p>هر اقدام کوچک، یک گام واقعی به اولین فروش نزدیک‌تر است.</p>
            <div className="progress-track" aria-label={`${progress} درصد تکمیل`}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-meta">
              <span>{completedTasks.length} اقدام از {totalTasks}</span>
              <strong>{progress}٪</strong>
            </div>
          </div>

          <div className="path-preview">
            <div className="section-mini-title">
              <span>مسیرهای پیشنهادی</span>
              <a href="#paths">مشاهده همه</a>
            </div>
            <div className="path-preview-list">
              {businessPaths.slice(0, 3).map((path) => (
                <button
                  className="path-preview-row"
                  key={path.number}
                  type="button"
                  onClick={() => choosePath(path.id)}
                >
                  <span className="path-number">{path.number}</span>
                  <span className="preview-copy">
                    <strong>{path.title}</strong>
                    <small>{path.tag}</small>
                  </span>
                  <span className="row-arrow" aria-hidden="true">↙</span>
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-note">
            <span className="note-orbit" />
            <p>اول خدمت بفروش؛ سپس تجربه را به محصول تبدیل کن.</p>
          </div>
        </aside>
      </section>

      <section className="paths-section" id="paths">
        <div className="section-heading">
          <div>
            <span className="section-kicker">پنج موتور درآمدی اختصاصی</span>
            <h2>یک تخصص؛ چند جریان درآمد</h2>
          </div>
          <p>
            هر مسیر براساس مهارت‌ها، اعتبار حرفه‌ای و هدف تو طراحی شده است. از
            درآمد سریع شروع کن و به محصول مقیاس‌پذیر برس.
          </p>
        </div>

        <div className="filter-bar" role="group" aria-label="فیلتر مسیرهای درآمد">
          {filters.map((filter) => (
            <button
              type="button"
              key={filter.id}
              className={activeFilter === filter.id ? "active" : ""}
              aria-pressed={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="path-card-grid">
          {filteredPaths.map((path) => (
            <article
              className={`business-card ${selectedPath === path.id ? "selected" : ""}`}
              key={path.id}
            >
              <div className="card-topline">
                <span className="large-number">{path.number}</span>
                <span className="path-tag">{path.tag}</span>
              </div>
              <h3>{path.title}</h3>
              <strong className="path-short">{path.short}</strong>
              <p>{path.description}</p>
              <dl>
                <div>
                  <dt>مدل درآمد</dt>
                  <dd>{path.revenue}</dd>
                </div>
                <div>
                  <dt>زمان شروع</dt>
                  <dd>{path.launch}</dd>
                </div>
              </dl>
              <div className="card-footer">
                <span>{path.score}</span>
                <button type="button" onClick={() => choosePath(path.id)}>
                  {selectedPath === path.id ? "مسیر منتخب" : "انتخاب مسیر"}
                  <span aria-hidden="true">←</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="roadmap-section" id="roadmap">
        <div className="roadmap-heading">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker light">برنامه اجرایی ۳۰ روزه</span>
              <h2>از ایده تا اولین مشتری</h2>
            </div>
            <p>
              کارهای انجام‌شده را علامت بزن. پیشرفت تو روی همین دستگاه ذخیره
              می‌شود و دفعه بعد از همان نقطه ادامه می‌دهی.
            </p>
          </div>
          <div className="progress-orb" style={ringStyle} aria-label={`${progress} درصد پیشرفت`}>
            <div>
              <strong>{progress}٪</strong>
              <span>پیشرفت کل</span>
            </div>
          </div>
        </div>

        <div className="roadmap-grid">
          {roadmapWeeks.map((week, weekIndex) => (
            <article className="week-column" key={week.week}>
              <div className="week-head">
                <div>
                  <span>{week.week}</span>
                  <h3>{week.title}</h3>
                </div>
                <small>{week.accent}</small>
              </div>
              <div className="task-list">
                {week.tasks.map((task, taskIndex) => {
                  const taskId = `${weekIndex}-${taskIndex}`;
                  const isDone = completedTasks.includes(taskId);
                  return (
                    <label className={`roadmap-task ${isDone ? "done" : ""}`} key={taskId}>
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleTask(taskId)}
                      />
                      <span className="custom-check" aria-hidden="true">{isDone ? "✓" : ""}</span>
                      <span>{task}</span>
                    </label>
                  );
                })}
              </div>
              <div className="week-progress">
                <span
                  style={{
                    width: `${
                      (week.tasks.filter((_, taskIndex) =>
                        completedTasks.includes(`${weekIndex}-${taskIndex}`),
                      ).length /
                        week.tasks.length) *
                      100
                    }%`,
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="strategy-section" id="strategy">
        <div className="strategy-shell">
          <div className="strategy-intro">
            <span className="section-kicker">مسیر منتخب تو</span>
            <span className="selection-number">{selected.number}</span>
            <h2>{selected.title}</h2>
            <p>{selected.description}</p>
            <div className="selection-meta">
              <span>{selected.revenue}</span>
              <span>{selected.launch} تا شروع</span>
            </div>
            <a className="dark-button" href="#roadmap">
              اجرای برنامه ۳۰ روزه
              <span aria-hidden="true">←</span>
            </a>
          </div>

          <div className="strategy-steps" aria-label="سه اقدام بعدی">
            <article>
              <span>۱</span>
              <div>
                <small>اقدام نخست</small>
                <h3>{pathActions[selected.id].first}</h3>
              </div>
            </article>
            <article>
              <span>۲</span>
              <div>
                <small>اعتبارسنجی</small>
                <h3>{pathActions[selected.id].second}</h3>
              </div>
            </article>
            <article>
              <span>۳</span>
              <div>
                <small>توسعه درآمد</small>
                <h3>{pathActions[selected.id].third}</h3>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="growth-section">
        <div className="growth-copy">
          <span className="section-kicker">معماری کسب‌وکار پیشنهادی</span>
          <h2>خدمت بفروش، آموزش بساز، محصول مقیاس بده.</h2>
          <p>
            سرمایه اصلی تو تجربه و اعتبار تخصصی است. با خدمت، مسئله واقعی بازار
            را کشف می‌کنی؛ با آموزش، جامعه می‌سازی؛ و با نرم‌افزار یا کیت، درآمد
            را از زمان شخصی جدا می‌کنی.
          </p>
        </div>
        <div className="growth-track">
          <div>
            <span>فاز ۱</span>
            <strong>خدمت تخصصی</strong>
            <small>ماه اول — نقدینگی و شناخت بازار</small>
          </div>
          <i />
          <div>
            <span>فاز ۲</span>
            <strong>آموزش و جامعه</strong>
            <small>ماه دوم — اعتبار و مخاطب وفادار</small>
          </div>
          <i />
          <div>
            <span>فاز ۳</span>
            <strong>محصول دیجیتال</strong>
            <small>ماه سوم — درآمد تکرارشونده</small>
          </div>
        </div>
      </section>

      <section className="ethics-note">
        <span className="ethics-mark">مرز حرفه‌ای</span>
        <p>
          فعالیت شخصی را از مسئولیت بازرسی سازمانی جدا نگه دار؛ از اسناد محرمانه
          و نشان رسمی استفاده نکن و مشتریِ تحت نظارت مستقیم خودت را نپذیر.
        </p>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark">BHB</span>
          <span className="brand-copy">
            <strong>آزمایشگاه سازه هوشمند</strong>
            <small>SMART STRUCTURE LAB</small>
          </span>
        </a>
        <p>تهیه، طراحی و تنظیم: یوسف بهرام‌بیگی</p>
        <span>نسخه نخست • ۱۴۰۵</span>
      </footer>
    </main>
  );
}
