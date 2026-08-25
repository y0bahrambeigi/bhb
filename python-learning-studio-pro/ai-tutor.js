/* Python Learning Studio Ultra — Adaptive AI Tutor
 * Client-side tutor UI + secure server-side gateway integration.
 * API secrets must NEVER be stored in this file or in browser localStorage.
 */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const MODES = {
    hint: { label: "راهنمای مرحله‌ای", icon: "💡" },
    debug: { label: "اشکال‌زدایی", icon: "🧩" },
    explain: { label: "توضیح مفهوم", icon: "📚" },
    civil: { label: "مهندسی عمران", icon: "🏗️" }
  };

  function currentLessonContext() {
    try {
      const lesson = window.LESSONS?.[window.state?.lesson];
      if (lesson) return { title: lesson.title, exercise: lesson.exercise?.text || "" };
    } catch (_) {}
    const task = $("taskBadge")?.textContent || "";
    const exercise = $("exerciseText")?.textContent || "";
    return { title: task, exercise };
  }

  function getEditorCode() {
    try {
      if (typeof window.getCode === "function") return window.getCode();
    } catch (_) {}
    return $("fallbackEditor")?.value || "";
  }

  function getConsoleText() {
    return ($("consolePane")?.textContent || "").slice(-4000);
  }

  function addTutorMessage(text, type, meta) {
    const chat = $("chat");
    if (!chat) return;
    const d = document.createElement("div");
    d.className = "msg " + type + " aiTutorMsg";
    const body = document.createElement("div");
    body.className = "aiTutorBody";
    body.textContent = text;
    d.appendChild(body);
    if (meta) {
      const m = document.createElement("small");
      m.className = "aiTutorMeta";
      m.textContent = meta;
      d.appendChild(m);
    }
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
  }

  function localTutor(question, mode, code, consoleText) {
    const q = question.toLowerCase();
    const hasSyntax = /syntaxerror|indentationerror|خطای نحوی|تورفتگی/.test((consoleText + " " + q).toLowerCase());
    const hasName = /nameerror|تعریف نشده/.test((consoleText + " " + q).toLowerCase());
    const hasType = /typeerror|نوع داده/.test((consoleText + " " + q).toLowerCase());

    if (mode === "debug" || q.includes("خطا") || q.includes("error")) {
      if (hasSyntax) return "راهنمای مرحله‌ای: ۱) خطی را که در Console مشخص شده پیدا کن. ۲) در انتهای if/for/while/def وجود «:» را کنترل کن. ۳) پرانتز، کوتیشن و تورفتگی ۴ فاصله‌ای را بررسی کن. بعد دوباره اجرا کن و اگر خطا ماند، متن دقیق Console را بفرست.";
      if (hasName) return "NameError یعنی یک نام قبل از تعریف استفاده شده است. نام متغیر/تابع را با حروف بزرگ و کوچک دقیق مقایسه کن، سپس بررسی کن خط تعریف آن قبل از خط استفاده اجرا می‌شود.";
      if (hasType) return "TypeError معمولاً یعنی عملیات روی نوع داده نامناسب انجام شده است. نوع متغیرهای درگیر را با type(...) چاپ کن و قبل از تغییر کد، مشخص کن هر متغیر باید عدد، رشته، لیست یا آرایه NumPy باشد.";
      return "برای اشکال‌زدایی: ابتدا اولین خطای Console را هدف بگیر، نه خطاهای بعدی. خط شماره‌دار، نوع Exception و ۳ تا ۵ خط کد اطراف آن را بررسی کن. اگر متن خطا را بفرستی، راهنمای دقیق‌تری می‌دهم.";
    }

    if (mode === "civil" || /خرپا|تیر|سازه|fem|اجزای محدود|sdof|زلزله/.test(q)) {
      if (/خرپا|truss/.test(q)) return "در تحلیل خرپای دوبعدی ترتیب کنترل پیشنهادی: هندسه و Connectivity → طول و cos/sin اعضا → ماتریس سختی عضو → Assembly → قیود مرزی → بردار بار → حل K u = F → بازیابی نیرو/تنش. اگر K تکین است، اول قیود و مکانیزم سازه را بررسی کن.";
      if (/تیر|beam/.test(q)) return "برای مسئله تیر، قبل از فرمول یا کد این چهار مورد را کنترل کن: مدل تکیه‌گاهی، نوع و محل بارگذاری، سازگاری واحدهای E/I/L/بار، و علامت‌گذاری خیز و لنگر. سپس نتیجه را با یک مقدار مرجع یا حل تحلیلی اعتبارسنجی کن.";
      if (/fem|اجزای محدود/.test(q)) return "در FEM بهتر است مسئله را به این زنجیره بشکنی: Element formulation → Shape functions → Jacobian/Integration → Element stiffness → Global assembly → Boundary conditions → Solve → Post-processing. بگو در کدام مرحله هستی تا همان بخش را باز کنیم.";
      return "در مسائل مهندسی، ابتدا فرضیات، واحدها، شرایط مرزی و معیار اعتبارسنجی را مشخص کن. سپس کد را مرحله‌ای بساز؛ خروجی عددی بدون کنترل مهندسی به‌تنهایی قابل اتکا نیست.";
    }

    if (mode === "explain") {
      if (/numpy/.test(q)) return "NumPy ابزار محاسبات آرایه‌ای Python است. مزیت اصلی آن انجام عملیات برداری و ماتریسی به‌جای حلقه‌های طولانی است؛ چیزی که برای محاسبات مهندسی، FEM، دینامیک و بهینه‌سازی بسیار کاربردی است.";
      if (/matplotlib|نمودار/.test(q)) return "Matplotlib برای visualization استفاده می‌شود. الگوی پایه: import matplotlib.pyplot as plt → تعریف داده → plt.plot(...) → افزودن label/title/grid → plt.show(). نمودار باید به تفسیر نتیجه کمک کند، نه فقط نمایش تزئینی باشد.";
      return "موضوع را به سه بخش می‌شکنیم: «تعریف مفهوم»، «مثال کوچک»، و «کاربرد مهندسی». سؤال را با نام دقیق مفهوم بنویس تا همین ساختار را روی آن اجرا کنم.";
    }

    if (code && code.trim()) return "من کد فعلی را در نظر می‌گیرم. به‌جای دادن جواب کامل، یک Hint: ابتدا کوچک‌ترین بخش کد را که باید نتیجه قابل پیش‌بینی تولید کند جداگانه اجرا کن؛ سپس مرحله بعد را اضافه کن. اگر هدفت را در یک جمله بگویی، Hint دقیق‌تر می‌شود.";
    return "سؤالت را با این قالب بفرست: «هدف من چیست؟»، «الان چه کدی دارم؟»، «چه خروجی/خطایی می‌بینم؟». من پاسخ را مرحله‌ای می‌دهم تا خودت به راه‌حل برسی.";
  }

  function ensureUI() {
    const pane = $("aiPane");
    if (!pane || $("aiTutorToolbar")) return;

    const style = document.createElement("style");
    style.textContent = `
      .aiTutorToolbar{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0}
      .aiModeBtn{border:1px solid rgba(110,180,255,.22);background:rgba(12,30,51,.72);color:#dcecff;border-radius:12px;padding:9px 8px;cursor:pointer;font:inherit}
      .aiModeBtn.active{border-color:#55d6e6;background:rgba(0,132,145,.20);box-shadow:0 0 0 1px rgba(85,214,230,.16) inset}
      .aiTutorActions{display:flex;gap:7px;flex-wrap:wrap;margin:9px 0}
      .aiQuick{font-size:11px;padding:7px 9px}
      .aiTutorMsg{white-space:pre-wrap;line-height:1.75}
      .aiTutorMeta{display:block;opacity:.58;margin-top:7px;font-size:10px}
      .aiTutorPrivacy{margin:9px 0;padding:9px 10px;border-radius:10px;background:rgba(201,158,62,.10);border:1px solid rgba(201,158,62,.18);font-size:10px;line-height:1.7}
      .aiContextToggle{display:flex;align-items:center;gap:7px;font-size:11px;margin:8px 0;color:var(--muted)}
      .aiContextToggle input{accent-color:#00a8b8}
    `;
    document.head.appendChild(style);

    const toolbar = document.createElement("div");
    toolbar.id = "aiTutorToolbar";
    toolbar.innerHTML = `
      <div class="aiTutorToolbar">
        ${Object.entries(MODES).map(([k,v])=>`<button class="aiModeBtn ${k==="hint"?"active":""}" data-ai-mode="${k}">${v.icon} ${v.label}</button>`).join("")}
      </div>
      <label class="aiContextToggle"><input type="checkbox" id="aiIncludeCode" checked> استفاده از کد فعلی و خروجی Console برای راهنمایی دقیق‌تر</label>
      <div class="aiTutorActions">
        <button class="btn ghost aiQuick" data-ai-q="کد من را بررسی کن و فقط اولین Hint را بده؛ جواب کامل را نگو.">💡 اولین Hint</button>
        <button class="btn ghost aiQuick" data-ai-q="خطای فعلی کد را مرحله‌به‌مرحله تحلیل کن.">🧩 تحلیل خطا</button>
        <button class="btn ghost aiQuick" data-ai-q="این کد را از نظر منطق، خوانایی و صحت مهندسی مرور کن.">🔎 مرور کد</button>
        <button class="btn ghost aiQuick" data-ai-q="برای موضوع فعلی یک تمرین کوتاه متناسب با سطح من بساز.">🎯 تمرین جدید</button>
      </div>
      <div class="aiTutorPrivacy">🔐 AI واقعی فقط از طریق Gateway امن سمت‌سرور متصل می‌شود. کلید API نباید در مرورگر، موبایل یا GitHub عمومی قرار گیرد.</div>
    `;
    const config = pane.querySelector(".aiConfig");
    if (config) config.insertAdjacentElement("afterend", toolbar);
    else pane.prepend(toolbar);

    pane.querySelectorAll("[data-ai-mode]").forEach(btn => btn.addEventListener("click", () => {
      pane.querySelectorAll("[data-ai-mode]").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      localStorage.setItem("pls_ai_mode", btn.dataset.aiMode);
    }));
    const savedMode = localStorage.getItem("pls_ai_mode") || "hint";
    pane.querySelector(`[data-ai-mode="${savedMode}"]`)?.click();

    pane.querySelectorAll("[data-ai-q]").forEach(btn => btn.addEventListener("click", () => {
      const input = $("aiInput");
      if (!input) return;
      input.value = btn.dataset.aiQ;
      window.askTutor();
    }));
  }

  window.saveAIEndpoint = function () {
    const ep = ($("aiEndpoint")?.value || "").trim();
    if (ep && !/^https:\/\//i.test(ep) && !/^http:\/\/localhost(?::\d+)?/i.test(ep)) {
      if (typeof window.toast === "function") window.toast("برای محیط واقعی از HTTPS استفاده کن");
      return;
    }
    localStorage.setItem("pls_ai_endpoint", ep);
    if ($("aiState")) $("aiState").textContent = ep ? "Gateway آماده" : "Tutor محلی";
    if (typeof window.toast === "function") window.toast(ep ? "AI Gateway ذخیره شد" : "حالت Tutor محلی فعال شد");
  };

  window.askTutor = async function () {
    ensureUI();
    const input = $("aiInput");
    const question = (input?.value || "").trim();
    if (!question) return;
    addTutorMessage(question, "user");
    input.value = "";

    const mode = document.querySelector("[data-ai-mode].active")?.dataset.aiMode || localStorage.getItem("pls_ai_mode") || "hint";
    const includeCode = $("aiIncludeCode")?.checked !== false;
    const code = includeCode ? getEditorCode().slice(0, 12000) : "";
    const consoleText = includeCode ? getConsoleText() : "";
    const lesson = currentLessonContext();
    const endpoint = localStorage.getItem("pls_ai_endpoint") || "";

    if (endpoint) {
      try {
        if ($("aiState")) $("aiState").textContent = "در حال فکر…";
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            mode,
            language: "fa",
            code,
            console: consoleText,
            lesson,
            app: { name: "Python Learning Studio Ultra", version: "1.0.2-ai-preview" }
          })
        });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const data = await response.json();
        const reply = data.reply || data.output_text || data.message || data.choices?.[0]?.message?.content;
        if (!reply) throw new Error("فرمت پاسخ Gateway شناخته نشد");
        addTutorMessage(reply, "bot", `${MODES[mode]?.label || "AI Tutor"} • AI Gateway`);
        if ($("aiState")) $("aiState").textContent = "AI Online";
        return;
      } catch (err) {
        addTutorMessage("اتصال AI برقرار نشد؛ برای ادامه از Tutor محلی استفاده می‌کنم.\n" + err.message, "bot", "Fallback امن");
        if ($("aiState")) $("aiState").textContent = "Fallback";
      }
    }

    const reply = localTutor(question, mode, code, consoleText);
    addTutorMessage(reply, "bot", `${MODES[mode]?.label || "Tutor"} • حالت محلی`);
  };

  document.addEventListener("DOMContentLoaded", ensureUI);
  if (document.readyState !== "loading") setTimeout(ensureUI, 0);
})();
