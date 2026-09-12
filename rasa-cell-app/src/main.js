import "@fontsource-variable/vazirmatn";
import "@fontsource/estedad/arabic-400.css";
import "@fontsource/estedad/arabic-600.css";
import "@fontsource/lalezar/arabic-400.css";
import "./styles.css";

import { StageController } from "./controller.js";
import { RasaModel } from "./model.js";
import { registerOffline, setupInstallExperience } from "./offline.js";
import { stageCount, stages } from "./stages.js";

const fa = new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: 2, useGrouping: false });
const controller = new StageController({ count: stageCount, interval: 3300 });
const list = document.getElementById("stage-list");
const dots = document.getElementById("timeline-dots");
const range = document.getElementById("stage-range");
const play = document.getElementById("play-stages");
const previous = document.getElementById("previous-stage");
const next = document.getElementById("next-stage");
const selectionCard = document.getElementById("selection-card");
const selectionDetail = document.getElementById("selection-detail");

const stageButtons = stages.map((stage, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "stage-item";
  button.dataset.index = String(index);
  button.innerHTML = `<span>${fa.format(index + 1)}</span><i></i><b>${stage.shortName}</b>`;
  button.setAttribute("aria-label", `مرحله ${index + 1}: ${stage.name}`);
  button.addEventListener("click", () => controller.go(index));
  list.appendChild(button);
  return button;
});

stages.forEach((_, index) => {
  const dot = document.createElement("i");
  dot.style.setProperty("--position", `${(index / (stageCount - 1)) * 100}%`);
  dots.appendChild(dot);
});

let model = null;
try {
  model = new RasaModel({
    canvas: document.getElementById("rasa-canvas"),
    container: document.getElementById("scene-card"),
    onSelect: (text) => {
      selectionDetail.textContent = text;
      selectionCard.hidden = false;
    }
  });
  document.getElementById("model-loading").hidden = true;
} catch (error) {
  const loading = document.getElementById("model-loading");
  loading.innerHTML = `<b>مدل سه‌بعدی در این دستگاه فعال نشد.</b><span>${error.message}</span>`;
  loading.classList.add("is-error");
}

function setMetrics(stage) {
  document.getElementById("metric-grid").innerHTML = stage.metrics
    .map(([label, value]) => `<div><span>${label}</span><b>${value}</b></div>`)
    .join("");
  document.getElementById("stage-actions").innerHTML = stage.actions
    .map((action) => `<li><i>✓</i><span>${action}</span></li>`)
    .join("");
}

controller.subscribe(({ index, count, playing, progress }) => {
  const stage = stages[index];
  document.getElementById("stage-kicker").textContent = `مرحله ${fa.format(index + 1)} · ${stage.kicker}`;
  document.getElementById("stage-name").textContent = stage.name;
  document.getElementById("stage-summary").textContent = stage.summary;
  document.getElementById("insight-title").textContent = stage.insight;
  document.getElementById("stage-counter").textContent = `${fa.format(index + 1)} / ${fa.format(count)}`;
  document.getElementById("progress-percent").textContent = `${Math.round(progress * 100).toLocaleString("fa-IR")}٪`;
  document.getElementById("progress-ring").style.setProperty("--progress", progress);
  range.value = String(index);
  range.style.setProperty("--progress", `${(index / (count - 1)) * 100}%`);
  previous.disabled = index === 0;
  next.disabled = index === count - 1;
  play.classList.toggle("is-playing", playing);
  play.setAttribute("aria-label", playing ? "توقف انیمیشن" : "پخش مراحل");
  stageButtons.forEach((button, buttonIndex) => {
    button.classList.toggle("is-active", buttonIndex === index);
    button.classList.toggle("is-complete", buttonIndex < index);
    button.setAttribute("aria-current", buttonIndex === index ? "step" : "false");
  });
  setMetrics(stage);
  selectionCard.hidden = true;
  model?.setStage(index);
});

previous.addEventListener("click", () => controller.previous());
next.addEventListener("click", () => controller.next());
play.addEventListener("click", () => controller.toggle());
range.addEventListener("input", (event) => controller.go(event.target.value));

const explode = document.getElementById("explode-model");
explode.addEventListener("click", () => {
  const active = explode.getAttribute("aria-pressed") !== "true";
  explode.setAttribute("aria-pressed", String(active));
  explode.classList.toggle("is-active", active);
  explode.querySelector("span").textContent = active ? "نمای مونتاژشده" : "نمای انفجاری";
  model?.setExploded(active);
});

const rotate = document.getElementById("toggle-auto-rotate");
rotate.addEventListener("click", () => {
  const active = rotate.getAttribute("aria-pressed") !== "true";
  rotate.setAttribute("aria-pressed", String(active));
  rotate.classList.toggle("is-active", active);
  model?.setAutoRotate(active);
});

document.getElementById("reset-camera").addEventListener("click", () => model?.resetCamera());
document.getElementById("close-selection").addEventListener("click", () => {
  selectionCard.hidden = true;
  model?.clearSelection();
});

const helpDialog = document.getElementById("help-dialog");
document.getElementById("show-help").addEventListener("click", () => helpDialog.showModal());
document.getElementById("toggle-fullscreen").addEventListener("click", async () => {
  if (document.fullscreenElement) await document.exitFullscreen();
  else await document.documentElement.requestFullscreen?.();
});

document.addEventListener("keydown", (event) => {
  if (event.target.matches("input, button, select")) return;
  if (event.key === "ArrowLeft") controller.next();
  if (event.key === "ArrowRight") controller.previous();
  if (event.key === " ") {
    event.preventDefault();
    controller.toggle();
  }
});

setupInstallExperience();
registerOffline();

window.addEventListener("beforeunload", () => {
  controller.destroy();
  model?.dispose();
});
