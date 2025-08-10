import { describe, it, expect } from 'vitest';

import { FakeClock } from '../../clock.ts';
import { MissionGenerator } from '../../generator.ts';
import { EngineStore } from '../../store.ts';
import type { TRobot } from '../../types.ts';

const idle = (id: string): TRobot => ({
  id, status: 'idle', missionId: null, batteryPct: 100, lastUpdated: 0
});

describe('MissionGenerator - rate and assignment', () => {
  it('creates 2 missions per minute and assigns when robots idle', () => {
    const clock = new FakeClock({ intervalMs: 1000 });
    const store = new EngineStore();
    // seed two idle robots
    store.applyRobot(idle('R-1'));
    store.applyRobot(idle('R-2'));

    const gen = new MissionGenerator(clock, store, { ratePerMinute: 2 });
    gen.start();
    clock.start();

    // advance 60s => expect 2 missions created and both assigned
    clock.advanceBy(60_000);

    const robots = store.getRobots();
    const missions = store.getMissions();
    expect(missions.length).toBe(2);
    expect(robots.filter(r => r.missionId !== null).length).toBe(2);
    expect(gen.getQueueLength()).toBe(0);
  });

  it('queues missions when no idle robots', () => {
    const clock = new FakeClock({ intervalMs: 1000 });
    const store = new EngineStore();

    const gen = new MissionGenerator(clock, store, { ratePerMinute: 2 });
    gen.start();
    clock.start();

    // advance 30s => 1 mission should be queued
    clock.advanceBy(30_000);
    expect(gen.getQueueLength()).toBe(1);

    // add an idle robot, next tick should assign
    store.applyRobot(idle('R-1'));
    clock.flush();

    expect(gen.getQueueLength()).toBe(0);
    const robots = store.getRobots();
    const missions = store.getMissions();
    expect(missions.length).toBe(1);
    expect(robots.length).toBeGreaterThan(0);
    const first = robots[0]!;
    expect(first.missionId).not.toBeNull();
  });
});
