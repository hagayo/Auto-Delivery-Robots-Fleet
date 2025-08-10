/**
 * Clock API - skeleton only. Implement in Cycle 3.
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

/** WallClock will use setInterval under the hood. */
export class WallClock implements Clock {
  constructor(_opts?: ClockOptions) {}
  start(): void { throw new Error('Not implemented'); }
  stop(): void { throw new Error('Not implemented'); }
  setSpeed(_speed: number): void { throw new Error('Not implemented'); }
  getSpeed(): number { throw new Error('Not implemented'); }
  isRunning(): boolean { throw new Error('Not implemented'); }
  now(): number { throw new Error('Not implemented'); }
  onTick(_cb: TickCallback): () => void { throw new Error('Not implemented'); }
}

/** FakeClock will allow manual advancement in tests. */
export class FakeClock implements Clock {
  constructor(_opts?: ClockOptions) {}
  start(): void { throw new Error('Not implemented'); }
  stop(): void { throw new Error('Not implemented'); }
  setSpeed(_speed: number): void { throw new Error('Not implemented'); }
  getSpeed(): number { throw new Error('Not implemented'); }
  isRunning(): boolean { throw new Error('Not implemented'); }
  now(): number { throw new Error('Not implemented'); }
  onTick(_cb: TickCallback): () => void { throw new Error('Not implemented'); }

  // test-only helpers to add later:
  // advanceBy(_ms: number): void { ... }
  // flush(): void { ... }
}
