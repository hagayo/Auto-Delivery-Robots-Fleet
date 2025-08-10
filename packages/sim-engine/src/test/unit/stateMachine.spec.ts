import { describe, it, expect } from 'vitest';

import { transitionState, toRobotStatus, isTerminal } from '../../stateMachine.ts';
import { evolveMission } from '../../stateMachine.ts';
import type { TMission } from '../../types.ts';

describe('stateMachine - transitions', () => {
  it('happy path: created -> assigned -> nav_to_pickup -> at_pickup -> nav_to_dropoff -> completed', () => {
    expect(transitionState('created', { type: 'assign' })).toBe('assigned');
    expect(transitionState('assigned', { type: 'arrive_at_pickup' })).toBe('navigating_to_pickup');
    expect(transitionState('navigating_to_pickup', { type: 'arrive_at_pickup' })).toBe('at_pickup');
    expect(transitionState('at_pickup', { type: 'pickup' })).toBe('navigating_to_dropoff');
    expect(transitionState('navigating_to_dropoff', { type: 'arrive_at_dropoff' })).toBe('completed');
    expect(isTerminal('completed')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(() => transitionState('created', { type: 'pickup' })).toThrow();
    expect(() => transitionState('assigned', { type: 'pickup' })).toThrow();
    expect(() => transitionState('completed', { type: 'assign' })).toThrow();
  });
});

describe('stateMachine - ui status mapping', () => {
  it('maps mission states to robot statuses', () => {
    expect(toRobotStatus('assigned')).toBe('assigned');
    expect(toRobotStatus('navigating_to_pickup')).toBe('en_route');
    expect(toRobotStatus('at_pickup')).toBe('delivering');
    expect(toRobotStatus('navigating_to_dropoff')).toBe('delivering');
    expect(toRobotStatus('completed')).toBe('completed');
  });
});

describe('stateMachine - evolveMission helper', () => {
  it('updates mission timeline immutably', () => {
    const m: TMission = {
      id: 'M-1',
      robotId: 'R-1',
      state: 'created',
      createdAt: 0,
      timeline: [],
      cancelReason: null
    };
    // import inline to avoid circular references in test runners
    // const { evolveMission } = await import('../../stateMachine.ts');

    const m1 = evolveMission(m, { type: 'assign' });
    const m2 = evolveMission(m1, { type: 'arrive_at_pickup' });

    expect(m.state).toBe('created');
    expect(m1.state).toBe('assigned');
    expect(m2.state).toBe('navigating_to_pickup');
    expect(m2.timeline.length).toBe(2);
  });
});
