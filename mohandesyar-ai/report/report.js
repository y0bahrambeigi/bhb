import {ensureActiveProject, listEvidence} from "../db.js";

const STATUS_LABELS = {draft: "پیش‌نویس", review: "نیازمند بازبینی", approved: "تأییدشده"};
const faNumber = new Intl.NumberFormat("fa-IR");
const faDateTime = new Intl.DateTimeFormat("fa-IR", {dateStyle: "long", timeStyle: "short"});
const objectUrls = [];
const imageLoads = [];

const $ = selector => document.querySelector(selector);

function setText(selector, value, fallback = "ثبت نشده") {
  $(selector).textContent = String(value || "").trim() || fallback;
}

function formatBytes(bytes = 0) {
  if (!bytes) return "۰ بایت";
  const units = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${faNumber.format(bytes / (1024 ** unit))} ${units[unit]}`;
}

function formatVisitDate(value) {
  if (!value) return "ثبت نشده";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : faDateTime.format(date);
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function evidenceImage(item) {
  const preview = element("div", "report-evidence-preview");
  if (item.blob && item.fileType?.startsWith("image/")) {
    const url = URL.createObjectURL(item.blob);
    objectUrls.push(url);
    const image = document.createElement("img");
    image.src = url;
    image.alt = `مدرک تصویری ${item.fileName}`;
    preview.appendChild(image);
    if (image.decode) imageLoads.push(image.decode().catch(() => undefined));
  } else {
    const label = item.missingFile ? "فایل موجود نیست" : (item.fileType?.startsWith("video/") ? "مدرک ویدئویی" : "فایل پیوست");
    preview.appendChild(element("span", "report-file-label", label));
  }
  return preview;
}

function renderEvidence(items) {
  const list = $("#report-evidence-list");
  list.replaceChildren();
  $("#report-evidence-count").textContent = `${faNumber.format(items.length)} مدرک`;
  $("#report-evidence-empty").classList.toggle("hidden", items.length > 0);

  items.forEach((item, index) => {
    const card = element("article", "report-evidence");
    card.appendChild(evidenceImage(item));
    const body = element("div", "report-evidence-body");
    body.appendChild(element("h3", "", `${faNumber.format(index + 1)}. ${item.fileName}`));
    const capturedAt = item.displayTime || formatVisitDate(item.capturedAt);
    body.appendChild(element("p", "", `${capturedAt} · ${formatBytes(item.size)} · ${item.fileType || "نوع نامشخص"}`));
    if (item.location) {
      body.appendChild(element("p", "report-location", `GPS: ${item.location.latitude.toFixed(6)}, ${item.location.longitude.toFixed(6)} · دقت تقریبی ${faNumber.format(Math.round(item.location.accuracy))} متر`));
    }
    body.appendChild(element("code", "report-hash", item.hash ? `SHA-256: ${item.hash}` : "هش فایل موجود نیست"));
    if (item.note) body.appendChild(element("p", "report-note", item.note));
    card.appendChild(body);
    list.appendChild(card);
  });
}

async function renderReport() {
  const project = await ensureActiveProject();
  const items = await listEvidence(project.id);
  const status = STATUS_LABELS[project.status] || STATUS_LABELS.draft;

  document.title = `${project.name} | گزارش مهندس‌یار AI`;
  setText("#report-title", `گزارش ${project.visitType || "بازدید پروژه"}`);
  setText("#report-number", project.reportNumber, "بدون شماره");
  setText("#report-status", status);
  setText("#project-name", project.name);
  setText("#visit-date", formatVisitDate(project.visitAt));
  setText("#project-code", project.projectCode);
  setText("#visit-type", project.visitType);
  setText("#project-address", project.address);
  setText("#project-parcel", project.parcel);
  setText("#permit-number", project.permitNumber);
  setText("#owner-name", project.ownerName);
  setText("#responsible-engineer", project.responsibleEngineer);
  setText("#report-recipient", project.recipient);
  setText("#report-description", project.description);
  setText("#report-findings", project.findings, "موردی ثبت نشده است.");
  setText("#report-recommendations", project.recommendations, "پیشنهادی ثبت نشده است.");
  setText("#generated-at", `تولید در ${faDateTime.format(new Date())}`);

  const watermark = $("#report-watermark");
  watermark.textContent = status;
  watermark.dataset.status = project.status;
  renderEvidence(items);
  await Promise.all(imageLoads);
  $("#report-document").setAttribute("aria-busy", "false");
  $("#report-load-state").textContent = `${faNumber.format(items.length)} مدرک در گزارش درج شد`;
  $("#print-report").disabled = false;
}

$("#print-report").addEventListener("click", () => window.print());
window.addEventListener("beforeunload", () => objectUrls.forEach(url => URL.revokeObjectURL(url)));

renderReport().catch(error => {
  console.error(error);
  $("#report-load-state").textContent = `خطا: ${error.message}`;
  $("#report-load-state").classList.add("report-error");
});
