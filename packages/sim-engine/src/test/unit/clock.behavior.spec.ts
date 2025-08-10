/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import { FakeClock, WallClock } from '../../clock.ts';

describe('FakeClock behavior', () => {
  it('advances and emits ticks at the right cadence', () => {
    const c = new FakeClock({ intervalMs: 1000 });
    let ticks = 0;
    c.onTick(() => ticks++);
    c.start();

    c.advanceBy(3000); // 3 ticks
    expect(ticks).toBe(3);
    expect(c.now()).toBe(3000);

    c.setSpeed(2); // 500ms per tick
    c.advanceBy(1000); // 2 ticks
    expect(ticks).toBe(5);
    expect(c.now()).toBe(4000);
  });
});

describe('WallClock control surface', () => {
  it('start/stop toggles running state', () => {
    const c = new WallClock({ intervalMs: 50 });
    expect(c.isRunning()).toBe(false);
    c.start();
    expect(c.isRunning()).toBe(true);
    c.stop();
    expect(c.isRunning()).toBe(false);
  });
});
