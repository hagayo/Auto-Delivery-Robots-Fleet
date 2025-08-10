import { describe, it, expect } from 'vitest';

import type { StoreEvent } from '../../store.ts';
import { EngineStore } from '../../store.ts';
import type { TRobot, TMission } from '../../types.ts';

describe('EngineStore behavior', () => {
  it('upserts and removes robots and missions, emitting events', () => {
    const s = new EngineStore();
    const events: StoreEvent[] = [];
    s.subscribe((e) => events.push(e));

    const r: TRobot = { id: 'R-1', status: 'idle', missionId: null, batteryPct: 100, lastUpdated: 0 };
    const m: TMission = {
      id: 'M-1',
      robotId: 'R-1',
      state: 'created',
      createdAt: 0,
      timeline: [],
      cancelReason: null
    };

    s.applyRobot(r);
    s.applyMission(m);

    expect(s.getRobot('R-1')).toBeDefined();
    expect(s.getMission('M-1')).toBeDefined();

    s.removeMission('M-1');
    s.removeRobot('R-1');

    expect(s.getMission('M-1')).toBeUndefined();
    expect(s.getRobot('R-1')).toBeUndefined();

    const types = events.map((e) => `${e.entity}:${e.type}`);
    expect(types).toEqual(['robot:upsert', 'mission:upsert', 'mission:remove', 'robot:remove']);
  });
});
