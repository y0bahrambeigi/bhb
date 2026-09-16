"use strict";

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const fa = (value, digits = 2) => new Intl.NumberFormat("fa-IR", {maximumFractionDigits: digits}).format(value);
const state = {view: "home", deferredInstall: null, bookLoaded: false, textSize: 17};

const views = {home: $("#homeView"), reader: $("#readerView"), lab: $("#labView"), compare: $("#compareView"), install: $("#installView")};
const toast = message => {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove("show"), 2600);
};

function closeMenus() {
  $("#sidebar").classList.remove("open");
  $("#chapterList").classList.remove("open");
  $("#scrim").classList.remove("show");
}

function setView(name, updateHash = true) {
  const next = views[name] ? name : "home";
  state.view = next;
  Object.entries(views).forEach(([key, element]) => element.classList.toggle("active", key === next));
  $$(".nav-button").forEach(button => button.classList.toggle("active", button.dataset.view === next));
  $("#viewTitle").textContent = views[next].dataset.title;
  closeMenus();
  if (updateHash) history.replaceState(null, "", `#${next}`);
  if (next === "reader") loadBook();
  if (next === "lab") requestAnimationFrame(updateSdof);
  window.scrollTo({top: 0, behavior: "smooth"});
}

$$("[data-view]").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
$$("[data-go]").forEach(button => button.addEventListener("click", () => setView(button.dataset.go)));
$("#menuButton").addEventListener("click", () => { $("#sidebar").classList.add("open"); $("#scrim").classList.add("show"); });
$("#chapterToggle").addEventListener("click", () => { $("#chapterList").classList.toggle("open"); $("#scrim").classList.toggle("show"); });
$("#scrim").addEventListener("click", closeMenus);

const savedTheme = localStorage.getItem("smart-structures-theme");
if (savedTheme === "dark" || (!savedTheme && matchMedia("(prefers-color-scheme: dark)").matches)) document.body.classList.add("dark");
$("#themeButton").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("smart-structures-theme", document.body.classList.contains("dark") ? "dark" : "light");
  if (state.view === "lab") updateSdof();
});

function updateConnection() {
  const online = navigator.onLine;
  $("#connectionState").textContent = online ? "برخط · نسخه آفلاین فعال" : "آفلاین · محتوای ذخیره‌شده";
  $("#connectionState").style.color = online ? "var(--teal)" : "var(--gold)";
}
addEventListener("online", updateConnection);
addEventListener("offline", updateConnection);
updateConnection();

addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  state.deferredInstall = event;
  $("#installButton").hidden = false;
});
$("#installButton").addEventListener("click", async () => {
  if (state.deferredInstall) {
    await state.deferredInstall.prompt();
    const choice = await state.deferredInstall.userChoice;
    toast(choice.outcome === "accepted" ? "نصب برنامه آغاز شد." : "نصب لغو شد؛ هر زمان خواستید دوباره امتحان کنید.");
    state.deferredInstall = null;
  } else {
    setView("install");
    toast("راهنمای نصب متناسب با iPhone و Android نمایش داده شد.");
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").then(() => {
    $("#offlineDot").classList.add("ready");
    $("#offlineTitle").textContent = "پوسته برنامه برای آفلاین آماده است";
  }).catch(() => { $("#offlineDetail").textContent = "برای فعال‌شدن حالت آفلاین، برنامه باید از HTTPS یا localhost اجرا شود."; });
  navigator.serviceWorker.addEventListener("message", event => {
    if (event.data?.type === "BOOK_CACHED") {
      $("#offlineDot").classList.add("ready");
      $("#offlineTitle").textContent = "کتاب کامل برای آفلاین ذخیره شد";
      $("#offlineDetail").textContent = "متن، تصاویر و ابزارها بدون اینترنت در دسترس‌اند.";
      toast("نسخه کامل کتاب روی این دستگاه ذخیره شد.");
    }
  });
}
$("#cacheBookButton").addEventListener("click", async () => {
  const registration = await navigator.serviceWorker?.ready;
  if (!registration?.active) return toast("حالت آفلاین هنوز آماده نشده است.");
  registration.active.postMessage({type: "CACHE_BOOK"});
  $("#offlineTitle").textContent = "در حال ذخیره متن و تصاویر…";
});

async function loadBook() {
  if (state.bookLoaded) return;
  try {
    const response = await fetch("book-content.html");
    if (!response.ok) throw new Error("book unavailable");
    $("#bookContent").innerHTML = await response.text();
    state.bookLoaded = true;
    prepareBook();
  } catch {
    $("#bookContent").innerHTML = `<div class="loading-card"><strong>متن کتاب بارگذاری نشد</strong><small>اتصال را بررسی و صفحه را دوباره باز کنید.</small></div>`;
  }
}

function prepareBook() {
  const content = $("#bookContent");
  const headings = [...content.querySelectorAll("h1,h2")];
  const list = $("#chapterList");
  list.innerHTML = headings.map((heading, index) => {
    if (!heading.id) heading.id = `section-${index + 1}`;
    return `<a class="level-${heading.tagName === "H1" ? 1 : 2}" href="#${heading.id}" data-target="${heading.id}">${heading.textContent.trim()}</a>`;
  }).join("");
  list.addEventListener("click", event => {
    const link = event.target.closest("a[data-target]");
    if (!link) return;
    event.preventDefault();
    document.getElementById(link.dataset.target)?.scrollIntoView({behavior: "smooth", block: "start"});
    localStorage.setItem("smart-structures-last", link.dataset.target);
    closeMenus();
  });
  const saved = localStorage.getItem("smart-structures-last");
  if (saved && document.getElementById(saved)) toast("آخرین محل مطالعه شما آماده است.");
  observeReading(headings);
  $("#searchCount").textContent = `${fa(headings.filter(h => h.tagName === "H1").length, 0)} بخش اصلی · متن کامل`;
}

function observeReading(headings) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    $$("#chapterList a").forEach(link => link.classList.toggle("active", link.dataset.target === visible.target.id));
    localStorage.setItem("smart-structures-last", visible.target.id);
  }, {rootMargin: "-150px 0px -65% 0px"});
  headings.forEach(heading => observer.observe(heading));
}

let searchTimer;
$("#bookSearch").addEventListener("input", event => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => searchBook(event.target.value.trim()), 180);
});
function searchBook(query) {
  const content = $("#bookContent");
  content.querySelectorAll("mark").forEach(mark => mark.replaceWith(document.createTextNode(mark.textContent)));
  content.normalize();
  if (query.length < 2) { $("#searchCount").textContent = "متن کامل ۴۰ صفحه‌ای"; return; }
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {acceptNode: node => node.parentElement?.closest("script,style") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT});
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  let count = 0;
  nodes.forEach(node => {
    if (count >= 100) return;
    const text = node.nodeValue;
    const lower = text.toLocaleLowerCase("fa");
    const needle = query.toLocaleLowerCase("fa");
    let from = 0;
    const fragment = document.createDocumentFragment();
    let changed = false;
    while (count < 100) {
      const index = lower.indexOf(needle, from);
      if (index < 0) break;
      changed = true;
      fragment.append(text.slice(from, index));
      const mark = document.createElement("mark");
      mark.textContent = text.slice(index, index + query.length);
      fragment.append(mark);
      from = index + query.length;
      count++;
    }
    if (changed) { fragment.append(text.slice(from)); node.replaceWith(fragment); }
  });
  $("#searchCount").textContent = count ? `${fa(count,0)} نتیجه` : "نتیجه‌ای یافت نشد";
  content.querySelector("mark")?.scrollIntoView({behavior: "smooth", block: "center"});
}

function setReaderSize(delta) {
  state.textSize = Math.min(23, Math.max(14, state.textSize + delta));
  document.documentElement.style.setProperty("--reader-size", `${state.textSize}px`);
  localStorage.setItem("smart-structures-text-size", state.textSize);
}
state.textSize = Number(localStorage.getItem("smart-structures-text-size")) || 17;
document.documentElement.style.setProperty("--reader-size", `${state.textSize}px`);
$("#increaseText").addEventListener("click", () => setReaderSize(1));
$("#decreaseText").addEventListener("click", () => setReaderSize(-1));

addEventListener("scroll", () => {
  if (state.view !== "reader") return;
  const max = document.documentElement.scrollHeight - innerHeight;
  const percent = max > 0 ? Math.min(100, Math.max(0, scrollY / max * 100)) : 0;
  $("#progressText").textContent = `${fa(percent,0)}٪`;
  $("#progressBar").style.width = `${percent}%`;
  localStorage.setItem("smart-structures-progress", String(percent));
}, {passive: true});
const savedProgress = Number(localStorage.getItem("smart-structures-progress")) || 0;
$("#progressText").textContent = `${fa(savedProgress,0)}٪`;
$("#progressBar").style.width = `${savedProgress}%`;

function updateSdof() {
  const mass = Number($("#mass").value), period = Number($("#period").value), zeta = Number($("#damping").value), ratio = Number($("#ratio").value);
  const result = SmartCalc.sdof(mass, period, zeta, ratio);
  $("#massOut").textContent = `${fa(mass,0)} kg`;
  $("#periodOut").textContent = `${fa(period)} s`;
  $("#dampingOut").textContent = `${fa(zeta*100,0)}٪`;
  $("#ratioOut").textContent = fa(ratio);
  $("#stiffnessResult").textContent = `${fa(result.stiffness/1e6)} MN/m`;
  $("#dampingResult").textContent = `${fa(result.damping/1e6,3)} MN·s/m`;
  $("#magnificationResult").textContent = fa(result.magnification);
  $("#frequencyResult").textContent = `${fa(result.frequency)} Hz`;
  drawFrequencyChart(zeta, ratio);
}
["mass","period","damping","ratio"].forEach(id => $("#"+id).addEventListener("input", updateSdof));

function drawFrequencyChart(zeta, selectedRatio) {
  const canvas = $("#frequencyChart"), rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.max(600, rect.width * dpr); canvas.height = Math.max(300, rect.height * dpr);
  const ctx = canvas.getContext("2d"), w = canvas.width, h = canvas.height, pad = 46*dpr;
  const maxY = Math.min(30, Math.max(5, 1/(2*zeta)*1.12));
  const x = r => pad + (r/3)*(w-2*pad), y = v => h-pad-(Math.min(v,maxY)/maxY)*(h-2*pad);
  const styles = getComputedStyle(document.body); ctx.clearRect(0,0,w,h); ctx.lineWidth=dpr; ctx.strokeStyle=styles.getPropertyValue("--line"); ctx.fillStyle=styles.getPropertyValue("--muted"); ctx.font=`${9*dpr}px Arial`; ctx.textAlign="center";
  for(let i=0;i<=6;i++){const r=i*.5;ctx.beginPath();ctx.moveTo(x(r),pad);ctx.lineTo(x(r),h-pad);ctx.stroke();ctx.fillText(r.toFixed(1),x(r),h-pad+18*dpr)}
  for(let i=0;i<=4;i++){const v=maxY*i/4;ctx.beginPath();ctx.moveTo(pad,y(v));ctx.lineTo(w-pad,y(v));ctx.stroke();ctx.textAlign="right";ctx.fillText(v.toFixed(1),pad-7*dpr,y(v)+3*dpr);ctx.textAlign="center"}
  ctx.beginPath();
  for(let i=0;i<=300;i++){const r=i/100, value=1/Math.sqrt((1-r*r)**2+(2*zeta*r)**2);i?ctx.lineTo(x(r),y(value)):ctx.moveTo(x(r),y(value))}
  ctx.strokeStyle=styles.getPropertyValue("--teal");ctx.lineWidth=3*dpr;ctx.stroke();
  const selected=1/Math.sqrt((1-selectedRatio**2)**2+(2*zeta*selectedRatio)**2);ctx.beginPath();ctx.arc(x(selectedRatio),y(selected),6*dpr,0,Math.PI*2);ctx.fillStyle=styles.getPropertyValue("--lime");ctx.fill();ctx.strokeStyle=styles.getPropertyValue("--navy");ctx.lineWidth=2*dpr;ctx.stroke();
}

function updateIsolation() {
  const mass=Number($("#isoMass").value), stiffness=Number($("#isoStiffness").value), zeta=Number($("#isoZeta").value)/100;
  if(mass<=0||stiffness<=0) return;
  const result=SmartCalc.baseIsolation(mass,stiffness,zeta);
  $("#isoPeriodResult").textContent=`${fa(result.period,3)} s`;
  $("#isoDampingResult").textContent=`ωᵦ = ${fa(result.omega,3)} rad/s · cᵦ = ${fa(result.damping/1e6,3)} MN·s/m`;
}
["isoMass","isoStiffness","isoZeta"].forEach(id=>$("#"+id).addEventListener("input",updateIsolation));

function updateDamper(){const c=Number($("#damperC").value),alpha=Number($("#damperAlpha").value),v=Number($("#damperVelocity").value);const force=SmartCalc.viscousDamper(c,alpha,v);$("#damperForceResult").textContent=`${fa(force,2)} kN`}
["damperC","damperAlpha","damperVelocity"].forEach(id=>$("#"+id).addEventListener("input",updateDamper));

function updateResonance(){const ag=Number($("#agInput").value),T=Number($("#resPeriod").value),z1=Number($("#zetaInitial").value),z2=Number($("#zetaTarget").value);if(T<=0||z1<=0||z2<=0)return;const result=SmartCalc.resonance(ag,T,z1,z2);$("#beforeResult").textContent=`${fa(result.before,3)} m`;$("#afterResult").textContent=`${fa(result.after,3)} m`;$("#beforeBar").style.width="100%";$("#afterBar").style.width=`${Math.min(100,result.after/result.before*100)}%`;$("#resonanceInsight").textContent=`با افزایش میرایی از ${fa(z1*100,1)}٪ به ${fa(z2*100,1)}٪، دامنه نظری پاسخ تشدیدی ${fa(result.reduction,1)}٪ کاهش می‌یابد. این نتیجه برای تحریک هارمونیک ماندگار و مدل خطی SDOF است.`}
["agInput","resPeriod","zetaInitial","zetaTarget"].forEach(id=>$("#"+id).addEventListener("input",updateResonance));

const comparison = {
  peakX:{title:"جابه‌جایی اوج",unit:"m",values:[.3287,.1323,.0421],text:"میراگر غیرفعال جابه‌جایی اوج را ۵۹٫۷٪ و LQR آن را ۸۷٫۲٪ کاهش داده است. برتری LQR در مدل ایده‌آل باید در عمل در برابر نویز، تأخیر و قطع توان کنترل شود."},
  peakA:{title:"شتاب اوج",unit:"g",values:[1.324,.584,.380],text:"در این تحریک، کنترل غیرفعال و فعال هر دو شتاب مطلق را کاهش داده‌اند. در طراحی عمومی، کاهش جابه‌جایی الزاماً به معنی کاهش شتاب نیست و هر دو شاخص باید کنترل شوند."},
  rmsX:{title:"RMS جابه‌جایی",unit:"m",values:[.1318,.0356,.0111],text:"شاخص RMS انرژی متوسط پاسخ را بهتر از یک قله منفرد بازتاب می‌دهد. LQR کمترین پاسخ RMS را در مثال کتاب ایجاد کرده است."},
  peakF:{title:"نیروی اوج دستگاه",unit:"MN",values:[0,2.067,2.900],text:"عملکرد بالاتر LQR با تقاضای نیروی بزرگ‌تر همراه است. انتخاب نهایی باید ظرفیت اتصال، کورس، توان و وضعیت خرابی را هم‌زمان در نظر بگیرد."}
};
function renderComparison(metric="peakX") {const item=comparison[metric],names=["Uncontrolled","Passive","LQR"],max=Math.max(...item.values,1e-9);$("#strategyBars").innerHTML=item.values.map((value,i)=>`<div class="strategy-row"><span>${names[i]}</span><div class="strategy-rail"><i style="width:${value/max*100}%"></i></div><strong>${value.toFixed(metric==="peakA"?3:4)} ${item.unit}</strong></div>`).join("");$("#decisionTitle").textContent=item.title;$("#decisionText").textContent=item.text}
$$(".metric-tabs button").forEach(button=>button.addEventListener("click",()=>{$$(".metric-tabs button").forEach(b=>b.classList.remove("active"));button.classList.add("active");renderComparison(button.dataset.metric)}));

$$("[data-chapter]").forEach(button => button.addEventListener("click", async () => {
  setView("reader"); await loadBook();
  const id = button.dataset.chapter;
  const target = document.getElementById(id) || [...$("#bookContent").querySelectorAll("h1")].find(h => h.id.includes(id.slice(0,20)));
  setTimeout(() => target?.scrollIntoView({behavior:"smooth",block:"start"}),100);
}));

updateSdof(); updateIsolation(); updateDamper(); updateResonance(); renderComparison();
const initialHash = location.hash.slice(1);
setView(views[initialHash] ? initialHash : "home", false);
