const BASE = "/bhb/mohandesyar-ai/";
const STORAGE_KEY = "mohandesyar-local-evidence-v1";

function updateConnection() {
  const node = document.getElementById("connection");
  if (!node) return;
  const online = navigator.onLine;
  node.className = `connection ${online ? "online" : "offline"}`;
  node.textContent = online
    ? "اتصال برقرار است؛ نسخه آفلاین نیز پس از نخستین بارگذاری آماده می‌شود."
    : "اینترنت قطع است؛ برنامه از نسخه ذخیره‌شده روی دستگاه اجرا می‌شود.";
}

function readLocalItems() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function writeLocalItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function renderLocalItems() {
  document.querySelectorAll(".local-row").forEach((node) => node.remove());
  const items = readLocalItems();
  const table = document.getElementById("evidence-table");
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "table-row local-row";
    [item.name, item.time, "روی این دستگاه", "ثبت محلی"].forEach((value, index) => {
      const span = document.createElement("span");
      span.textContent = value;
      if (index === 3) span.className = "ok";
      row.appendChild(span);
    });
    table.appendChild(row);
  });
  document.getElementById("evidence-count").textContent = String(3 + items.length).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

document.getElementById("file-input")?.addEventListener("change", (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  const formatter = new Intl.DateTimeFormat("fa-IR", {dateStyle:"short", timeStyle:"short"});
  const items = readLocalItems();
  files.forEach((file) => items.push({name: `${file.type.startsWith("video/") ? "ویدئو" : "تصویر"} · ${file.name}`, time: formatter.format(new Date())}));
  writeLocalItems(items.slice(-25));
  renderLocalItems();
  event.target.value = "";
});

document.getElementById("clear-local")?.addEventListener("click", () => {
  if (readLocalItems().length && confirm("موارد محلی از روی این دستگاه پاک شوند؟")) {
    localStorage.removeItem(STORAGE_KEY);
    renderLocalItems();
  }
});

window.addEventListener("online", updateConnection);
window.addEventListener("offline", updateConnection);
updateConnection();
renderLocalItems();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register(`${BASE}sw.js`, {scope: BASE}).catch(() => {}));
}
