import type { TMission } from './types.js';

export type MissionEvent =
  | { type: 'assign' }                // created -> assigned
  | { type: 'depart_to_pickup' }      // assigned -> navigating_to_pickup
  | { type: 'arrive_at_pickup' }      // navigating_to_pickup -> at_pickup
  | { type: 'depart_to_dropoff' }     // at_pickup -> navigating_to_dropoff
  | { type: 'arrive_at_dropoff' }     // navigating_to_dropoff -> completed
  | { type: 'complete' }              // force complete from any non-terminal
  | { type: 'cancel' }                // -> canceled
  | { type: 'abort' };                // -> aborting

export function isTerminal(state: TMission['state']): boolean {
  return state === 'completed' || state === 'canceled' || state === 'aborting';
}

function appendTimeline(m: TMission, entry: TMission['timeline'][number]): TMission {
  return { ...m, timeline: [...m.timeline, entry] };
}

function setState(m: TMission, next: TMission['state'], now: number) {
  if (m.state === next) return m;
  return appendTimeline(m, { state: next, at: now });
}

export function evolveMission(m: TMission, evt: MissionEvent, now = Date.now()): TMission {
  if (isTerminal(m.state)) return m;

  switch (evt.type) {
    case 'assign':
      if (m.state === 'created') return { ...setState(m, 'assigned', now), state: 'assigned' };
      return m;

    case 'depart_to_pickup':
      if (m.state === 'assigned') return { ...setState(m, 'navigating_to_pickup', now), state: 'navigating_to_pickup' };
      return m;

    case 'arrive_at_pickup':
      if (m.state === 'navigating_to_pickup') return { ...setState(m, 'at_pickup', now), state: 'at_pickup' };
      return m;

    case 'depart_to_dropoff':
      if (m.state === 'at_pickup') return { ...setState(m, 'navigating_to_dropoff', now), state: 'navigating_to_dropoff' };
      return m;

    case 'arrive_at_dropoff':
    case 'complete':
      if (!isTerminal(m.state)) return { ...setState(m, 'completed', now), state: 'completed' };
      return m;

    case 'cancel':
      return { ...setState(m, 'canceled', now), state: 'canceled', cancelReason: 'operator' };

    case 'abort':
      return { ...setState(m, 'aborting', now), state: 'aborting' };
  }
}

export function cancelMission(m: TMission, now: number): TMission {
  return evolveMission(m, { type: 'cancel' }, now);
}

export function toRobotStatus(state: TMission['state']): 'idle'|'assigned'|'en_route'|'delivering'|'completed' {
  switch (state) {
    case 'navigating_to_pickup':
    case 'at_pickup':
      return 'en_route';
    case 'navigating_to_dropoff':
      return 'delivering';
    case 'completed':
      return 'completed';
    case 'canceled':
      return 'idle';
    default:
      return 'assigned';
  }
}
