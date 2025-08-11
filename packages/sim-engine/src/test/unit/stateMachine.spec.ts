import { describe, it, expect } from 'vitest';
import { evolveMission, cancelMission } from '../../stateMachine.ts';
import type { TMission } from '../../types.ts';

const make = (state: TMission['state'] = 'created'): TMission => ({
  id: 'T-1', robotId: 'R-1', state, createdAt: 0, timeline: [], cancelReason: null
});

describe('state machine', () => {
  it('created -> assigned -> navigating_to_pickup -> at_pickup -> navigating_to_dropoff -> completed', () => {
    let m = make('created');
    m = evolveMission(m, { type: 'assign' }, 1);
    expect(m.state).toBe('assigned');

    m = evolveMission(m, { type: 'depart_to_pickup' }, 2);
    expect(m.state).toBe('navigating_to_pickup');

    m = evolveMission(m, { type: 'arrive_at_pickup' }, 3);
    expect(m.state).toBe('at_pickup');

    m = evolveMission(m, { type: 'depart_to_dropoff' }, 4);
    expect(m.state).toBe('navigating_to_dropoff');

    m = evolveMission(m, { type: 'arrive_at_dropoff' }, 5);
    expect(m.state).toBe('completed');
  });

  it('cancel from assigned', () => {
    const canceled = cancelMission(make('assigned'), 10);
    expect(canceled.state).toBe('canceled');
    expect(canceled.cancelReason).toBe('operator');
  });
});
