const DB_NAME = "mohandesyar-production-v2";
const DB_VERSION = 1;
const PROJECT_STORE = "projects";
const EVIDENCE_STORE = "evidence";
const META_STORE = "meta";

let databasePromise;

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("خطای پایگاه داده محلی"));
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("تراکنش محلی ناموفق بود"));
    transaction.onabort = () => reject(transaction.error || new Error("تراکنش محلی لغو شد"));
  });
}

export function createId(prefix = "item") {
  if (crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function localDateTimeValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function createBlankProject() {
  const now = new Date().toISOString();
  return {
    id: createId("project"),
    name: "پروژه جدید",
    projectCode: "",
    visitType: "بازدید عمومی",
    address: "",
    parcel: "",
    permitNumber: "",
    ownerName: "",
    responsibleEngineer: "",
    visitAt: localDateTimeValue(),
    recipient: "",
    reportNumber: "",
    description: "",
    findings: "",
    recommendations: "",
    status: "draft",
    createdAt: now,
    updatedAt: now
  };
}

export function openDatabase() {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROJECT_STORE)) {
        const projects = db.createObjectStore(PROJECT_STORE, {keyPath: "id"});
        projects.createIndex("updatedAt", "updatedAt");
      }
      if (!db.objectStoreNames.contains(EVIDENCE_STORE)) {
        const evidence = db.createObjectStore(EVIDENCE_STORE, {keyPath: "id"});
        evidence.createIndex("projectId", "projectId");
        evidence.createIndex("createdAt", "createdAt");
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, {keyPath: "key"});
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("بازکردن پایگاه داده محلی ممکن نشد"));
    request.onblocked = () => reject(new Error("نسخه قدیمی برنامه هنوز در برگه دیگری باز است"));
  });
  return databasePromise;
}

export async function getMeta(key) {
  const db = await openDatabase();
  const transaction = db.transaction(META_STORE, "readonly");
  const record = await requestResult(transaction.objectStore(META_STORE).get(key));
  return record?.value;
}

export async function setMeta(key, value) {
  const db = await openDatabase();
  const transaction = db.transaction(META_STORE, "readwrite");
  transaction.objectStore(META_STORE).put({key, value});
  await transactionDone(transaction);
}

export async function listProjects() {
  const db = await openDatabase();
  const transaction = db.transaction(PROJECT_STORE, "readonly");
  const projects = await requestResult(transaction.objectStore(PROJECT_STORE).getAll());
  return projects.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export async function getProject(id) {
  if (!id) return null;
  const db = await openDatabase();
  const transaction = db.transaction(PROJECT_STORE, "readonly");
  return requestResult(transaction.objectStore(PROJECT_STORE).get(id));
}

export async function saveProject(project) {
  const now = new Date().toISOString();
  const record = {
    ...project,
    id: project.id || createId("project"),
    createdAt: project.createdAt || now,
    updatedAt: now
  };
  const db = await openDatabase();
  const transaction = db.transaction(PROJECT_STORE, "readwrite");
  transaction.objectStore(PROJECT_STORE).put(record);
  await transactionDone(transaction);
  return record;
}

export async function setActiveProject(id) {
  await setMeta("activeProjectId", id);
}

export async function ensureActiveProject() {
  const activeId = await getMeta("activeProjectId");
  const activeProject = await getProject(activeId);
  if (activeProject) return activeProject;

  const existing = await listProjects();
  if (existing.length) {
    await setActiveProject(existing[0].id);
    return existing[0];
  }

  const project = await saveProject(createBlankProject());
  await setActiveProject(project.id);
  return project;
}

export async function deleteProject(projectId) {
  const db = await openDatabase();
  const transaction = db.transaction([PROJECT_STORE, EVIDENCE_STORE], "readwrite");
  transaction.objectStore(PROJECT_STORE).delete(projectId);
  const index = transaction.objectStore(EVIDENCE_STORE).index("projectId");
  const cursorRequest = index.openCursor(IDBKeyRange.only(projectId));
  cursorRequest.onsuccess = () => {
    const cursor = cursorRequest.result;
    if (!cursor) return;
    cursor.delete();
    cursor.continue();
  };
  await transactionDone(transaction);
}

export async function sha256(blob) {
  if (!blob || !crypto.subtle) return "";
  const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function addEvidence({projectId, file, location = null, note = ""}) {
  const now = new Date().toISOString();
  const record = {
    id: createId("evidence"),
    projectId,
    fileName: file.name || "مدرک بدون نام",
    fileType: file.type || "application/octet-stream",
    size: file.size || 0,
    lastModified: file.lastModified || null,
    capturedAt: now,
    createdAt: now,
    note,
    location,
    hash: await sha256(file),
    blob: file,
    missingFile: false
  };
  const db = await openDatabase();
  const transaction = db.transaction(EVIDENCE_STORE, "readwrite");
  transaction.objectStore(EVIDENCE_STORE).put(record);
  await transactionDone(transaction);
  return record;
}

export async function addLegacyEvidence(projectId, item) {
  const now = new Date().toISOString();
  const record = {
    id: createId("legacy"),
    projectId,
    fileName: item.name || "مدرک قدیمی",
    fileType: "application/octet-stream",
    size: 0,
    lastModified: null,
    capturedAt: now,
    createdAt: now,
    displayTime: item.time || "",
    note: "فقط مشخصات نسخه قدیمی؛ فایل اصلی در برنامه ذخیره نشده بود.",
    location: null,
    hash: "",
    blob: null,
    missingFile: true
  };
  const db = await openDatabase();
  const transaction = db.transaction(EVIDENCE_STORE, "readwrite");
  transaction.objectStore(EVIDENCE_STORE).put(record);
  await transactionDone(transaction);
}

export async function listEvidence(projectId) {
  const db = await openDatabase();
  const transaction = db.transaction(EVIDENCE_STORE, "readonly");
  const records = await requestResult(transaction.objectStore(EVIDENCE_STORE).index("projectId").getAll(projectId));
  return records.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function listAllEvidence() {
  const db = await openDatabase();
  const transaction = db.transaction(EVIDENCE_STORE, "readonly");
  return requestResult(transaction.objectStore(EVIDENCE_STORE).getAll());
}

export async function deleteEvidence(id) {
  const db = await openDatabase();
  const transaction = db.transaction(EVIDENCE_STORE, "readwrite");
  transaction.objectStore(EVIDENCE_STORE).delete(id);
  await transactionDone(transaction);
}

export async function updateEvidence(id, changes) {
  const db = await openDatabase();
  const readTransaction = db.transaction(EVIDENCE_STORE, "readonly");
  const current = await requestResult(readTransaction.objectStore(EVIDENCE_STORE).get(id));
  if (!current) throw new Error("مدرک موردنظر پیدا نشد");
  const writeTransaction = db.transaction(EVIDENCE_STORE, "readwrite");
  writeTransaction.objectStore(EVIDENCE_STORE).put({...current, ...changes, updatedAt: new Date().toISOString()});
  await transactionDone(writeTransaction);
}

export async function clearProjectEvidence(projectId) {
  const db = await openDatabase();
  const transaction = db.transaction(EVIDENCE_STORE, "readwrite");
  const index = transaction.objectStore(EVIDENCE_STORE).index("projectId");
  const cursorRequest = index.openCursor(IDBKeyRange.only(projectId));
  cursorRequest.onsuccess = () => {
    const cursor = cursorRequest.result;
    if (!cursor) return;
    cursor.delete();
    cursor.continue();
  };
  await transactionDone(transaction);
}

function blobToDataUrl(blob) {
  if (!blob) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("خواندن فایل پشتیبان ناموفق بود"));
    reader.readAsDataURL(blob);
  });
}

export async function createBackup() {
  const [projects, evidence, activeProjectId] = await Promise.all([
    listProjects(),
    listAllEvidence(),
    getMeta("activeProjectId")
  ]);
  const evidenceWithFiles = await Promise.all(evidence.map(async item => {
    const {blob, ...metadata} = item;
    return {...metadata, dataUrl: await blobToDataUrl(blob)};
  }));
  return {
    format: "mohandesyar-backup",
    version: 2,
    exportedAt: new Date().toISOString(),
    activeProjectId,
    projects,
    evidence: evidenceWithFiles
  };
}

async function dataUrlToBlob(dataUrl) {
  if (!dataUrl) return null;
  const response = await fetch(dataUrl);
  return response.blob();
}

export async function restoreBackup(backup, {replace = false} = {}) {
  if (backup?.format !== "mohandesyar-backup" || backup.version !== 2) {
    throw new Error("فرمت فایل پشتیبان معتبر یا پشتیبانی‌شده نیست");
  }
  if (!Array.isArray(backup.projects) || !Array.isArray(backup.evidence)) {
    throw new Error("ساختار فایل پشتیبان ناقص است");
  }

  const evidence = await Promise.all(backup.evidence.map(async item => {
    const {dataUrl, ...metadata} = item;
    return {...metadata, blob: await dataUrlToBlob(dataUrl)};
  }));

  const db = await openDatabase();
  const transaction = db.transaction([PROJECT_STORE, EVIDENCE_STORE, META_STORE], "readwrite");
  if (replace) {
    transaction.objectStore(PROJECT_STORE).clear();
    transaction.objectStore(EVIDENCE_STORE).clear();
    transaction.objectStore(META_STORE).clear();
  }
  backup.projects.forEach(project => transaction.objectStore(PROJECT_STORE).put(project));
  evidence.forEach(item => transaction.objectStore(EVIDENCE_STORE).put(item));
  if (backup.activeProjectId) {
    transaction.objectStore(META_STORE).put({key: "activeProjectId", value: backup.activeProjectId});
  }
  await transactionDone(transaction);
}

export async function storageEstimate() {
  if (!navigator.storage?.estimate) return null;
  return navigator.storage.estimate();
}
