import { describe, it, expect } from 'vitest';

import { pickNextRobot } from '../../assignment.ts';
import type { TRobot } from '../../types.ts';

const mk = (id: string, lastUpdated: number): TRobot => ({
  id, status: 'idle', missionId: null, batteryPct: 100, lastUpdated
});

describe('pickNextRobot - fairness', () => {
  it('chooses the robot that has been idle longest', () => {
    const now = 10_000;
    const idle = [mk('R-2', 9_000), mk('R-1', 8_000), mk('R-3', 9_000)];
    const picked = pickNextRobot(idle);
    expect(picked?.id).toBe('R-1');     // oldest lastUpdated wins
  });

  it('tie-breaks by id when lastUpdated equal', () => {
    const now = 10_000;
    const idle = [mk('R-2', 9_000), mk('R-1', 9_000)];
    const picked = pickNextRobot(idle);
    expect(picked?.id).toBe('R-1');
  });

  it('returns undefined for empty set', () => {
    const picked = pickNextRobot([]);
    expect(picked).toBeUndefined();
  });
});
