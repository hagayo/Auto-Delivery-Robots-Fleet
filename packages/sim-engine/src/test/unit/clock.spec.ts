import { describe, it, expect } from 'vitest';

import { WallClock, FakeClock } from '../../clock.ts';

describe('clock API shape', () => {
  it('WallClock exposes the required methods', () => {
    const c = new WallClock();
    expect(typeof c.start).toBe('function');
    expect(typeof c.stop).toBe('function');
    expect(typeof c.setSpeed).toBe('function');
    expect(typeof c.getSpeed).toBe('function');
    expect(typeof c.isRunning).toBe('function');
    expect(typeof c.now).toBe('function');
    expect(typeof c.onTick).toBe('function');
  });

  it('FakeClock exposes the required methods', () => {
    const c = new FakeClock();
    expect(typeof c.start).toBe('function');
    expect(typeof c.stop).toBe('function');
    expect(typeof c.setSpeed).toBe('function');
    expect(typeof c.getSpeed).toBe('function');
    expect(typeof c.isRunning).toBe('function');
    expect(typeof c.now).toBe('function');
    expect(typeof c.onTick).toBe('function');
  });
});
