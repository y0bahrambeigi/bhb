import {
  addEvidence,
  addLegacyEvidence,
  clearProjectEvidence,
  createBackup,
  createBlankProject,
  deleteEvidence,
  deleteProject,
  ensureActiveProject,
  getMeta,
  listEvidence,
  listProjects,
  restoreBackup,
  saveProject,
  setActiveProject,
  setMeta,
  storageEstimate,
  updateEvidence
} from "./db.js";

const BASE = "/bhb/mohandesyar-ai/";
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const LEGACY_STORAGE_KEY = "mohandesyar-local-evidence-v1";
const STATUS_LABELS = {draft: "پیش‌نویس", review: "نیازمند بازبینی", approved: "تأییدشده"};
const faNumber = new Intl.NumberFormat("fa-IR");
const faDateTime = new Intl.DateTimeFormat("fa-IR", {dateStyle: "medium", timeStyle: "short"});

let activeProject = null;
let projects = [];
let evidence = [];
let saveTimer = null;
const pendingEvidenceNotes = new Map();
const evidenceNoteWrites = new Set();
let deferredInstallPrompt = null;
let offlineReady = false;
let previewUrls = [];

const $ = selector => document.querySelector(selector);

function setNotice(message, type = "info") {
  $("#notice-text").textContent = message;
  $("#app-notice").dataset.type = type;
}

function formatBytes(bytes = 0) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "۰ بایت";
  const units = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${faNumber.format(bytes / (1024 ** unit))} ${units[unit]}`;
}

function statusLabel(status) {
  return STATUS_LABELS[status] || STATUS_LABELS.draft;
}

function createElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function updateConnection() {
  const node = $("#connection");
  if (navigator.onLine && offlineReady) {
    node.className = "connection online";
    node.textContent = "اتصال برقرار است؛ نسخه آفلاین نیز آماده استفاده است.";
  } else if (navigator.onLine) {
    node.className = "connection checking";
    node.textContent = "اتصال برقرار است؛ در حال آماده‌سازی فایل‌های آفلاین…";
  } else if (offlineReady) {
    node.className = "connection offline";
    node.textContent = "اینترنت قطع است؛ برنامه و داده‌های محلی در دسترس هستند.";
  } else {
    node.className = "connection error";
    node.textContent = "اینترنت قطع است و آماده‌بودن نسخه آفلاین تأیید نشده است.";
  }
}

function projectFromForm() {
  const values = Object.fromEntries(new FormData($("#project-form")).entries());
  return {
    ...activeProject,
    ...values,
    name: String(values.name || "").trim() || "پروژه بدون نام"
  };
}

function fillProjectForm(project) {
  const form = $("#project-form");
  for (const [key, value] of Object.entries(project)) {
    const control = form.elements.namedItem(key);
    if (control) control.value = value ?? "";
  }
}

async function persistProject({silent = false} = {}) {
  if (!activeProject) return;
  $("#save-state").textContent = "در حال ذخیره…";
  activeProject = await saveProject(projectFromForm());
  await setActiveProject(activeProject.id);
  $("#save-state").textContent = "ذخیره شد";
  await refreshProjects();
  updateProjectHeader();
  if (!silent) setNotice("اطلاعات پرونده با موفقیت روی این دستگاه ذخیره شد.", "success");
}

function scheduleAutosave() {
  $("#save-state").textContent = "تغییر ذخیره‌نشده";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => persistProject({silent: true}).catch(handleError), 900);
}

function trackEvidenceNoteWrite(promise) {
  evidenceNoteWrites.add(promise);
  promise.then(
    () => evidenceNoteWrites.delete(promise),
    () => evidenceNoteWrites.delete(promise)
  );
  return promise;
}

function scheduleEvidenceNoteSave(id, value) {
  const pending = pendingEvidenceNotes.get(id);
  if (pending) clearTimeout(pending.timer);
  const entry = {value, timer: null};
  entry.timer = setTimeout(() => {
    if (pendingEvidenceNotes.get(id) !== entry) return;
    pendingEvidenceNotes.delete(id);
    trackEvidenceNoteWrite(updateEvidence(id, {note: entry.value})).catch(handleError);
  }, 600);
  pendingEvidenceNotes.set(id, entry);
}

async function flushPendingEvidenceNotes() {
  const pending = [...pendingEvidenceNotes.entries()];
  pendingEvidenceNotes.clear();
  pending.forEach(([, entry]) => clearTimeout(entry.timer));
  await Promise.all([...evidenceNoteWrites]);
  await Promise.all(pending.map(([id, entry]) => updateEvidence(id, {note: entry.value})));
}

async function discardPendingEvidenceNotes(id) {
  const entries = id ? [[id, pendingEvidenceNotes.get(id)]] : [...pendingEvidenceNotes.entries()];
  for (const [evidenceId, entry] of entries) {
    if (!entry) continue;
    clearTimeout(entry.timer);
    pendingEvidenceNotes.delete(evidenceId);
  }
  await Promise.all([...evidenceNoteWrites]);
}

async function flushPendingWrites() {
  clearTimeout(saveTimer);
  if (activeProject) await persistProject({silent: true});
  await flushPendingEvidenceNotes();
}

function updateProjectHeader() {
  if (!activeProject) return;
  const label = statusLabel(activeProject.status);
  $("#active-project-label").textContent = `پرونده فعال: ${activeProject.name}`;
  $("#project-status-pill").textContent = label;
  $("#project-status-pill").dataset.status = activeProject.status;
  $("#report-status").textContent = label;
}

async function refreshProjects() {
  projects = await listProjects();
  const select = $("#project-select");
  const selectedId = activeProject?.id;
  select.replaceChildren();
  for (const project of projects) {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = `${project.name} — ${statusLabel(project.status)}`;
    select.appendChild(option);
  }
  if (selectedId) select.value = selectedId;
  $("#project-count").textContent = faNumber.format(projects.length);
}

function revokePreviewUrls() {
  previewUrls.forEach(url => URL.revokeObjectURL(url));
  previewUrls = [];
}

function evidencePreview(item) {
  const wrapper = createElement("div", "evidence-preview");
  if (item.missingFile || !item.blob) {
    wrapper.appendChild(createElement("span", "file-symbol missing", "!"));
    return wrapper;
  }
  const objectUrl = URL.createObjectURL(item.blob);
  previewUrls.push(objectUrl);
  if (item.fileType.startsWith("image/")) {
    const image = document.createElement("img");
    image.src = objectUrl;
    image.alt = `پیش‌نمایش ${item.fileName}`;
    image.loading = "lazy";
    wrapper.appendChild(image);
  } else if (item.fileType.startsWith("video/")) {
    const video = document.createElement("video");
    video.src = objectUrl;
    video.controls = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", `ویدئو ${item.fileName}`);
    wrapper.appendChild(video);
  } else {
    wrapper.appendChild(createElement("span", "file-symbol", "FILE"));
  }
  return wrapper;
}

function downloadEvidenceFile(item) {
  if (!item.blob) return;
  const url = URL.createObjectURL(item.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = item.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2_000);
}

function renderEvidence() {
  revokePreviewUrls();
  const list = $("#evidence-list");
  list.replaceChildren();
  $("#evidence-empty").classList.toggle("hidden", evidence.length > 0);

  for (const item of evidence) {
    const card = createElement("article", "evidence-card");
    card.appendChild(evidencePreview(item));

    const details = createElement("div", "evidence-details");
    details.appendChild(createElement("h3", "", item.fileName));
    const captured = item.displayTime || faDateTime.format(new Date(item.capturedAt));
    details.appendChild(createElement("p", "evidence-meta", `${captured} · ${formatBytes(item.size)} · ${item.fileType}`));
    if (item.location) {
      details.appendChild(createElement("p", "evidence-location", `GPS: ${item.location.latitude.toFixed(6)}, ${item.location.longitude.toFixed(6)} · دقت ${faNumber.format(Math.round(item.location.accuracy))} متر`));
    }
    if (item.hash) {
      const hash = createElement("code", "evidence-hash", `SHA-256: ${item.hash.slice(0, 24)}…`);
      hash.title = item.hash;
      details.appendChild(hash);
    }
    const note = document.createElement("textarea");
    note.className = "evidence-note-input";
    note.rows = 2;
    note.maxLength = 500;
    note.placeholder = "توضیح این مدرک برای درج در گزارش…";
    note.value = item.note || "";
    note.addEventListener("input", () => {
      scheduleEvidenceNoteSave(item.id, note.value.trim());
    });
    details.appendChild(note);
    if (item.missingFile) details.appendChild(createElement("p", "evidence-warning", item.note));
    card.appendChild(details);

    const actions = createElement("div", "evidence-actions");
    const download = createElement("button", "button mini ghost", "دریافت فایل");
    download.type = "button";
    download.disabled = !item.blob;
    download.addEventListener("click", () => downloadEvidenceFile(item));
    const remove = createElement("button", "button mini danger", "حذف");
    remove.type = "button";
    remove.addEventListener("click", async () => {
      if (!confirm(`مدرک «${item.fileName}» برای همیشه از این دستگاه حذف شود؟`)) return;
      await discardPendingEvidenceNotes(item.id);
      await deleteEvidence(item.id);
      await refreshEvidence();
      setNotice("مدرک انتخاب‌شده حذف شد.", "success");
    });
    actions.append(download, remove);
    card.appendChild(actions);
    list.appendChild(card);
  }
}

async function refreshEvidence() {
  evidence = activeProject ? await listEvidence(activeProject.id) : [];
  renderEvidence();
  $("#evidence-count").textContent = faNumber.format(evidence.length);
  $("#evidence-size").textContent = formatBytes(evidence.reduce((total, item) => total + (item.size || 0), 0));
  await updateStorageEstimate();
}

async function updateStorageEstimate() {
  const estimate = await storageEstimate();
  if (!estimate?.quota) {
    $("#storage-summary").textContent = "حافظه محلی فعال";
    return;
  }
  const percent = Math.min(100, (estimate.usage / estimate.quota) * 100);
  $("#storage-summary").textContent = `${formatBytes(estimate.usage)} از ${formatBytes(estimate.quota)}`;
  $("#storage-progress").style.width = `${percent}%`;
}

function currentLocation() {
  if (!$("#capture-location").checked) return Promise.resolve(null);
  if (!navigator.geolocation) return Promise.reject(new Error("GPS در این مرورگر پشتیبانی نمی‌شود"));
  $("#location-status").textContent = "در حال دریافت موقعیت…";
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(position => {
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        recordedAt: new Date(position.timestamp).toISOString()
      };
      $("#location-status").textContent = `موقعیت دریافت شد؛ دقت تقریبی ${faNumber.format(Math.round(location.accuracy))} متر.`;
      resolve(location);
    }, error => {
      $("#location-status").textContent = "دریافت موقعیت انجام نشد؛ فایل بدون GPS ذخیره می‌شود.";
      reject(new Error(error.message || "دریافت موقعیت ممکن نشد"));
    }, {enableHighAccuracy: true, timeout: 12_000, maximumAge: 30_000});
  });
}

async function handleFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length || !activeProject) return;
  const invalid = files.find(file => !file.type.startsWith("image/") && !file.type.startsWith("video/"));
  if (invalid) throw new Error(`نوع فایل «${invalid.name}» پشتیبانی نمی‌شود`);
  const oversized = files.find(file => file.size > MAX_FILE_SIZE);
  if (oversized) throw new Error(`حجم «${oversized.name}» بیش از ۱۰۰ مگابایت است`);

  const progress = $("#upload-progress");
  progress.classList.remove("hidden");
  let location = null;
  try { location = await currentLocation(); }
  catch (error) { setNotice(error.message, "warning"); }

  for (let index = 0; index < files.length; index += 1) {
    progress.textContent = `در حال ذخیره و محاسبه هش مدرک ${faNumber.format(index + 1)} از ${faNumber.format(files.length)}…`;
    await addEvidence({projectId: activeProject.id, file: files[index], location});
  }
  await navigator.storage?.persist?.();
  progress.classList.add("hidden");
  await refreshEvidence();
  setNotice(`${faNumber.format(files.length)} مدرک همراه با فایل اصلی و هش SHA-256 ذخیره شد.`, "success");
}

async function switchProject(projectId) {
  if (activeProject) await flushPendingWrites();
  activeProject = projects.find(project => project.id === projectId) || await ensureActiveProject();
  await setActiveProject(activeProject.id);
  fillProjectForm(activeProject);
  updateProjectHeader();
  await refreshProjects();
  await refreshEvidence();
  setNotice(`پرونده «${activeProject.name}» فعال شد.`, "success");
}

async function createNewProject() {
  if (activeProject) await flushPendingWrites();
  activeProject = await saveProject(createBlankProject());
  await setActiveProject(activeProject.id);
  fillProjectForm(activeProject);
  await refreshProjects();
  updateProjectHeader();
  await refreshEvidence();
  $("#project-form [name='name']").focus();
  setNotice("پرونده جدید ساخته شد؛ مشخصات آن را تکمیل کنید.", "success");
}

async function removeActiveProject() {
  if (!activeProject) return;
  if (!confirm(`پرونده «${activeProject.name}» و همه فایل‌های شواهد آن برای همیشه حذف شوند؟`)) return;
  clearTimeout(saveTimer);
  await discardPendingEvidenceNotes();
  await deleteProject(activeProject.id);
  activeProject = await ensureActiveProject();
  await setActiveProject(activeProject.id);
  fillProjectForm(activeProject);
  await refreshProjects();
  updateProjectHeader();
  await refreshEvidence();
  setNotice("پرونده حذف شد و یک پرونده فعال در دسترس قرار گرفت.", "success");
}

async function migrateLegacyMetadata() {
  if (await getMeta("legacyEvidenceMigrated")) return 0;
  let legacy = [];
  try { legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "[]"); }
  catch { legacy = []; }
  if (Array.isArray(legacy)) {
    for (const item of legacy) await addLegacyEvidence(activeProject.id, item);
  }
  await setMeta("legacyEvidenceMigrated", true);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  return legacy.length;
}

function downloadJson(data, name) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2_000);
}

async function exportBackup() {
  const button = $("#export-backup");
  button.disabled = true;
  button.textContent = "در حال آماده‌سازی…";
  try {
    await flushPendingWrites();
    const backup = await createBackup();
    const date = new Date().toISOString().slice(0, 10);
    downloadJson(backup, `mohandesyar-backup-${date}.json`);
    setNotice("نسخه پشتیبان شامل پرونده‌ها و فایل‌های شواهد ساخته شد.", "success");
  } finally {
    button.disabled = false;
    button.textContent = "دریافت پشتیبان";
  }
}

async function importBackupFile(file) {
  if (!file) return;
  const replace = $("#replace-on-import").checked;
  if (replace && !confirm("بازیابی جایگزین، همه داده‌های فعلی را حذف می‌کند. ادامه می‌دهید؟")) return;
  const backup = JSON.parse(await file.text());
  await restoreBackup(backup, {replace});
  activeProject = await ensureActiveProject();
  fillProjectForm(activeProject);
  await refreshProjects();
  updateProjectHeader();
  await refreshEvidence();
  setNotice("فایل پشتیبان با موفقیت بازیابی شد.", "success");
}

function handleError(error) {
  console.error(error);
  const quota = error?.name === "QuotaExceededError";
  setNotice(quota ? "فضای ذخیره‌سازی دستگاه کافی نیست؛ پشتیبان بگیرید و فایل‌های غیرضروری را حذف کنید." : (error?.message || "عملیات ناموفق بود."), "error");
  $("#upload-progress")?.classList.add("hidden");
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    updateConnection();
    setNotice("مرورگر فعلی از اجرای آفلاین پشتیبانی نمی‌کند.", "warning");
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register(`${BASE}sw.js`, {scope: BASE});
    await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error("مهلت آماده‌سازی آفلاین پایان یافت")), 15_000))
    ]);
    offlineReady = Boolean(registration.active || navigator.serviceWorker.controller);
    registration.addEventListener("updatefound", () => setNotice("نسخه جدید برنامه در حال آماده‌سازی است.", "info"));
  } catch (error) {
    offlineReady = false;
    setNotice(`آماده‌سازی نسخه آفلاین ناموفق بود: ${error.message}`, "error");
  }
  updateConnection();
}

function bindEvents() {
  $("#project-form").addEventListener("submit", event => {
    event.preventDefault();
    clearTimeout(saveTimer);
    persistProject().catch(handleError);
  });
  $("#project-form").addEventListener("input", scheduleAutosave);
  $("#project-select").addEventListener("change", event => switchProject(event.target.value).catch(handleError));
  $("#new-project").addEventListener("click", () => createNewProject().catch(handleError));
  $("#delete-project").addEventListener("click", () => removeActiveProject().catch(handleError));
  $("#file-input").addEventListener("change", event => {
    handleFiles(event.target.files).catch(handleError).finally(() => { event.target.value = ""; });
  });
  $("#camera-input").addEventListener("change", event => {
    handleFiles(event.target.files).catch(handleError).finally(() => { event.target.value = ""; });
  });
  $("#clear-evidence").addEventListener("click", async () => {
    if (!evidence.length || !confirm("همه شواهد این پرونده برای همیشه از دستگاه حذف شوند؟")) return;
    await discardPendingEvidenceNotes();
    await clearProjectEvidence(activeProject.id);
    await refreshEvidence();
    setNotice("همه شواهد پرونده حذف شدند.", "success");
  });
  $("#export-backup").addEventListener("click", () => exportBackup().catch(handleError));
  $("#import-backup").addEventListener("change", event => {
    importBackupFile(event.target.files?.[0]).catch(handleError).finally(() => { event.target.value = ""; });
  });
  $("#install-app").addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    $("#install-app").classList.add("hidden");
  });
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    $("#install-app").classList.remove("hidden");
  });
  window.addEventListener("appinstalled", () => setNotice("مهندس‌یار AI روی دستگاه نصب شد.", "success"));
  document.querySelectorAll('a[href="./report/"]').forEach(link => link.addEventListener("click", event => {
    event.preventDefault();
    flushPendingWrites()
      .then(() => window.location.assign(link.href))
      .catch(handleError);
  }));
  window.addEventListener("online", updateConnection);
  window.addEventListener("offline", updateConnection);
}

async function initialize() {
  bindEvents();
  updateConnection();
  activeProject = await ensureActiveProject();
  const migrated = await migrateLegacyMetadata();
  fillProjectForm(activeProject);
  await refreshProjects();
  updateProjectHeader();
  await refreshEvidence();
  if (migrated) {
    setNotice(`${faNumber.format(migrated)} رکورد نسخه قدیمی منتقل شد؛ فایل اصلی آن رکوردها در نسخه قدیمی ذخیره نشده بود.`, "warning");
  } else {
    setNotice("پایگاه داده محلی آماده است؛ اطلاعات شما به سرور ارسال نمی‌شود.", "success");
  }
  registerServiceWorker();
}

initialize().catch(handleError);
