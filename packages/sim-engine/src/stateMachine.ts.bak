/**
 * Mission lifecycle - pure state machine and UI-status mapping.
 */
import type { TMission, TMissionState, TRobotStatus } from './types.js';

export type MissionEvent =
  | { type: 'assign' }
  | { type: 'arrive_at_pickup' }
  | { type: 'pickup' }
  | { type: 'arrive_at_dropoff' }
  | { type: 'complete' };

type Next = Record<TMissionState, MissionEvent['type'][]>;

const ALLOWED: Next = {
  created: ['assign'],
  assigned: ['arrive_at_pickup'],
  navigating_to_pickup: ['arrive_at_pickup'], // alias of assigned -> arrive
  at_pickup: ['pickup'],
  navigating_to_dropoff: ['arrive_at_dropoff'],
  completed: [] as const,
  aborting: [] as const, // used later in cancel flow
  canceled: [] as const  // used later in cancel flow
};

/** Compute next state from current + event or throw on invalid transition. */
export function transitionState(state: TMissionState, evt: MissionEvent): TMissionState {
  const allowed = ALLOWED[state] ?? [];
  if (!allowed.includes(evt.type)) {
    throw new Error(`invalid transition: ${state} -> ${evt.type}`);
  }
  switch (state) {
    case 'created':
      return 'assigned';
    case 'assigned':
      return 'navigating_to_pickup';
    case 'navigating_to_pickup':
      return 'at_pickup';
    case 'at_pickup':
      return 'navigating_to_dropoff';
    case 'navigating_to_dropoff':
      return 'completed';
    case 'completed':
    case 'aborting':
    case 'canceled':
      return state; // terminal
    default:
      return assertNever(state);
  }
}

export function isTerminal(state: TMissionState): boolean {
  return state === 'completed' || state === 'canceled';
}

/** Map mission state -> robot status for the UI table. */
export function toRobotStatus(state: TMissionState): TRobotStatus {
  switch (state) {
    case 'created':
    case 'assigned':
      return 'assigned';
    case 'navigating_to_pickup':
      return 'en_route';
    case 'at_pickup':
    case 'navigating_to_dropoff':
      return 'delivering';
    case 'completed':
      return 'completed';
    case 'aborting':
    case 'canceled':
      // cancel semantics will be refined in Cycle 6
      return 'idle';
    default:
      return assertNever(state);
  }
}

/** Helper to build a new mission with next state (no side effects). */
export function evolveMission(m: TMission, evt: MissionEvent): TMission {
  const next = transitionState(m.state, evt);
  return {
    ...m,
    state: next,
    timeline: [...m.timeline, { state: next, at: Date.now() }]
  };
}

function assertNever(x: never): never {
  throw new Error(`unhandled case: ${String(x)}`);
}
