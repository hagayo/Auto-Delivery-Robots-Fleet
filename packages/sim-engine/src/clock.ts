/**
 * Clock - deterministic time source with real (WallClock) and test (FakeClock) impls.
 */
export type TickCallback = (now: number) => void;

export interface ClockOptions {
  intervalMs?: number; // default 1000
  speed?: number;      // 1.0 = real time
}

export interface Clock {
  start(): void;
  stop(): void;
  setSpeed(speed: number): void;
  getSpeed(): number;
  isRunning(): boolean;
  now(): number;
  onTick(cb: TickCallback): () => void; // returns unsubscribe
}

/** WallClock uses setInterval - speed adjusts the effective interval. */
export class WallClock implements Clock {
  private readonly baseInterval: number;
  private speedVal: number;
  private timer: ReturnType<typeof setInterval> | null = null;
  private subscribers = new Set<TickCallback>();

  constructor(opts: ClockOptions = {}) {
    this.baseInterval = Math.max(1, Math.floor(opts.intervalMs ?? 1000));
    this.speedVal = opts.speed ?? 1;
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.emit(Date.now()), this.effectiveInterval());
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  setSpeed(speed: number): void {
    this.speedVal = Math.max(0.0001, speed);
    if (this.timer) {
      // restart timer with new cadence
      clearInterval(this.timer);
      this.timer = setInterval(() => this.emit(Date.now()), this.effectiveInterval());
    }
  }

  getSpeed(): number {
    return this.speedVal;
  }

  isRunning(): boolean {
    return this.timer != null;
  }

  now(): number {
    return Date.now();
  }

  onTick(cb: TickCallback): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  private effectiveInterval(): number {
    return Math.max(1, Math.floor(this.baseInterval / this.speedVal));
  }

  private emit(now: number): void {
    for (const cb of this.subscribers) cb(now);
  }
}

/** FakeClock - manual time advancement for tests. */
export class FakeClock implements Clock {
  private readonly baseInterval: number;
  private speedVal: number;
  private running = false;
  private subscribers = new Set<TickCallback>();
  private nowMs = 0;
  private carry = 0; // fractional remainder for partial intervals

  constructor(opts: ClockOptions = {}) {
    this.baseInterval = Math.max(1, Math.floor(opts.intervalMs ?? 1000));
    this.speedVal = opts.speed ?? 1;
  }

  start(): void {
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  setSpeed(speed: number): void {
    this.speedVal = Math.max(0.0001, speed);
  }

  getSpeed(): number {
    return this.speedVal;
  }

  isRunning(): boolean {
    return this.running;
  }

  now(): number {
    return this.nowMs;
  }

  onTick(cb: TickCallback): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  /** Test helper - advance fake time by ms and emit ticks accordingly. */
  advanceBy(ms: number): void {
    if (!this.running || ms <= 0) {
      this.nowMs += Math.max(0, ms);
      return;
    }
    const step = this.baseInterval / this.speedVal; // ms per tick
    let remaining = this.carry + ms;

    while (remaining + 1e-9 >= step) {
      remaining -= step;
      this.nowMs += step;
      for (const cb of this.subscribers) cb(this.nowMs);
    }
    this.carry = remaining;
  }

  /** Test helper - force a tick without time passing. */
  flush(): void {
    for (const cb of this.subscribers) cb(this.nowMs);
  }
}
