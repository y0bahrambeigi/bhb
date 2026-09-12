export class StageController {
  constructor({ count, interval = 3400, scheduler = globalThis } = {}) {
    if (!Number.isInteger(count) || count < 1) throw new Error("Stage count must be a positive integer");
    this.count = count;
    this.interval = interval;
    this.scheduler = scheduler;
    this.index = 0;
    this.playing = false;
    this.listeners = new Set();
    this.timer = null;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  snapshot() {
    return {
      index: this.index,
      count: this.count,
      playing: this.playing,
      progress: (this.index + 1) / this.count
    };
  }

  emit() {
    const state = this.snapshot();
    this.listeners.forEach((listener) => listener(state));
  }

  clamp(index) {
    const numeric = Number(index);
    return Math.max(0, Math.min(this.count - 1, Number.isFinite(numeric) ? Math.round(numeric) : 0));
  }

  go(index, { stop = true } = {}) {
    if (stop) this.pause();
    this.index = this.clamp(index);
    this.emit();
    return this.index;
  }

  next() {
    return this.go(this.index + 1);
  }

  previous() {
    return this.go(this.index - 1);
  }

  toggle() {
    if (this.playing) {
      this.pause();
      return false;
    }
    this.play();
    return true;
  }

  play() {
    if (this.index === this.count - 1) this.index = 0;
    this.playing = true;
    this.emit();
    this.schedule();
  }

  schedule() {
    this.clearTimer();
    if (!this.playing) return;
    this.timer = this.scheduler.setTimeout(() => {
      if (this.index < this.count - 1) {
        this.index += 1;
        this.emit();
        this.schedule();
      } else {
        this.pause();
      }
    }, this.interval);
  }

  clearTimer() {
    if (this.timer !== null) this.scheduler.clearTimeout(this.timer);
    this.timer = null;
  }

  pause() {
    const changed = this.playing;
    this.playing = false;
    this.clearTimer();
    if (changed) this.emit();
  }

  destroy() {
    this.pause();
    this.listeners.clear();
  }
}
