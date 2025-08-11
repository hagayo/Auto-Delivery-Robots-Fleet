import { describe, it, expect } from 'vitest';
import { cancelMission } from '../../stateMachine.ts';
import type { TMission } from '../../types.ts';

const m = (id='M-1'): TMission => ({
  id, robotId: 'R-1', state: 'assigned', createdAt: 0, timeline: [], cancelReason: null
});

describe('cancelMission', () => {
  it('sets state to canceled and appends timeline', () => {
    const t0 = Date.now();
    const next = cancelMission(m(), t0);
    expect(next.state).toBe('canceled');
    expect(next.cancelReason).toBe('operator');
    expect(next.timeline.at(-1)).toEqual({ state: 'canceled', at: t0 });
  });

  it('is idempotent for terminal states', () => {
    const done = { ...m(), state: 'completed' as const };
    const next = cancelMission(done, Date.now());
    expect(next).toEqual(done);
  });
});
