import { describe, it, expect } from 'vitest';
import { robotsReducer, initialRobots, list, type Robot } from '../../src/state/robots';

const r = (id: string): Robot => ({
  id, status: 'idle', missionId: null, batteryPct: 100, lastUpdated: 0
});


describe('robotsReducer', () => {
  it('applies snapshot and upsert/remove', () => {
    const s1 = robotsReducer(initialRobots, { type: 'snapshot', robots: [r('R-2')] });
    expect(list(s1).map(x => x.id)).toEqual(['R-2']);

    const s2 = robotsReducer(s1, { type: 'upsert', robot: r('R-1') });
    expect(list(s2).map(x => x.id)).toEqual(['R-1', 'R-2']);

    const s3 = robotsReducer(s2, { type: 'remove', robot: r('R-1') });
    expect(list(s3).map(x => x.id)).toEqual(['R-2']);
  });
});
