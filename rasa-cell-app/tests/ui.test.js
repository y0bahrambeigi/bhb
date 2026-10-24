// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";

const modelState = vi.hoisted(() => ({
  setStage: vi.fn(),
  setExploded: vi.fn(),
  setAutoRotate: vi.fn(),
  resetCamera: vi.fn(),
  clearSelection: vi.fn(),
  dispose: vi.fn()
}));

vi.mock("../src/model.js", () => ({
  RasaModel: class {
    constructor() {
      return modelState;
    }
  }
}));

vi.mock("../src/offline.js", () => ({
  registerOffline: vi.fn(() => Promise.resolve()),
  setupInstallExperience: vi.fn()
}));

describe("RASA Cell interface", () => {
  beforeAll(async () => {
    const source = readFileSync(path.join(process.cwd(), "index.html"), "utf8");
    const body = source.match(/<body>([\s\S]*?)<script type="module"/)[1];
    document.body.innerHTML = body;
    window.matchMedia = vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    document.documentElement.requestFullscreen = vi.fn(() => Promise.resolve());
    document.exitFullscreen = vi.fn(() => Promise.resolve());
    await import("../src/main.js");
  });

  it("renders all nine construction stages", () => {
    const buttons = document.querySelectorAll(".stage-item");
    expect(buttons).toHaveLength(9);
    expect(document.getElementById("stage-name").textContent).toBe("پی و جانمایی دیجیتال");
    expect(buttons[0].getAttribute("aria-current")).toBe("step");
  });

  it("moves with next, previous and direct stage buttons", () => {
    document.getElementById("next-stage").click();
    expect(document.getElementById("stage-name").textContent).toBe("صفحات پایه و اتصال خشک");
    document.getElementById("previous-stage").click();
    expect(document.getElementById("stage-name").textContent).toBe("پی و جانمایی دیجیتال");
    document.querySelectorAll(".stage-item")[8].click();
    expect(document.getElementById("stage-name").textContent).toBe("تعویض فیوز و بهره‌برداری مجدد");
    expect(document.getElementById("next-stage").disabled).toBe(true);
  });

  it("updates the stage from the timeline", () => {
    const range = document.getElementById("stage-range");
    range.value = "4";
    range.dispatchEvent(new Event("input", { bubbles: true }));
    expect(document.getElementById("stage-name").textContent).toBe("کف کامپوزیت فوق‌سبک");
    expect(document.getElementById("stage-counter").textContent).toContain("۰۵");
  });

  it("connects exploded view, auto rotation and camera reset to the 3D model", () => {
    const explode = document.getElementById("explode-model");
    explode.click();
    expect(explode.getAttribute("aria-pressed")).toBe("true");
    expect(modelState.setExploded).toHaveBeenLastCalledWith(true);

    const rotate = document.getElementById("toggle-auto-rotate");
    rotate.click();
    expect(rotate.getAttribute("aria-pressed")).toBe("true");
    expect(modelState.setAutoRotate).toHaveBeenLastCalledWith(true);

    document.getElementById("reset-camera").click();
    expect(modelState.resetCamera).toHaveBeenCalled();
  });

  it("starts and stops stage playback from the play button", () => {
    const play = document.getElementById("play-stages");
    play.click();
    expect(play.classList.contains("is-playing")).toBe(true);
    expect(play.getAttribute("aria-label")).toBe("توقف انیمیشن");
    play.click();
    expect(play.classList.contains("is-playing")).toBe(false);
  });
});
