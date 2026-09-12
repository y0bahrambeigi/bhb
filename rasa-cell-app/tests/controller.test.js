import { describe, expect, it, vi } from "vitest";
import { StageController } from "../src/controller.js";

describe("StageController", () => {
  it("clamps navigation to the valid stage range", () => {
    const controller = new StageController({ count: 9 });
    expect(controller.go(20)).toBe(8);
    expect(controller.go(-4)).toBe(0);
    expect(controller.next()).toBe(1);
    expect(controller.previous()).toBe(0);
  });

  it("publishes a complete state snapshot", () => {
    const controller = new StageController({ count: 9 });
    const states = [];
    controller.subscribe((state) => states.push(state));
    controller.go(4);
    expect(states.at(-1)).toEqual({ index: 4, count: 9, playing: false, progress: 5 / 9 });
  });

  it("plays through every stage and stops at the end", () => {
    vi.useFakeTimers();
    const controller = new StageController({ count: 3, interval: 100, scheduler: globalThis });
    controller.play();
    expect(controller.playing).toBe(true);
    vi.advanceTimersByTime(100);
    expect(controller.index).toBe(1);
    vi.advanceTimersByTime(100);
    expect(controller.index).toBe(2);
    vi.advanceTimersByTime(100);
    expect(controller.playing).toBe(false);
    vi.useRealTimers();
  });

  it("restarts from stage zero when play is pressed at the end", () => {
    const controller = new StageController({ count: 3 });
    controller.go(2);
    controller.play();
    expect(controller.index).toBe(0);
    controller.destroy();
  });

  it("clears scheduled playback when manually navigating", () => {
    vi.useFakeTimers();
    const controller = new StageController({ count: 4, interval: 100, scheduler: globalThis });
    controller.play();
    controller.go(2);
    vi.advanceTimersByTime(500);
    expect(controller.index).toBe(2);
    expect(controller.playing).toBe(false);
    vi.useRealTimers();
  });
});
