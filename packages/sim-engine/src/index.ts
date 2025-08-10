// explicit re-exports so d.ts includes all names
export type { Store, StoreEvent, Unsubscribe } from './store.js';
export { EngineStore } from './store.js';

export type { Clock, ClockOptions, TickCallback } from './clock.js';
export { WallClock, FakeClock } from './clock.js';

export type { GeneratorOptions } from './generator.js';
export { MissionGenerator } from './generator.js';

export {
  transitionState,
  toRobotStatus,
  isTerminal,
  evolveMission
} from './stateMachine.js';

export * from './types.js';

export const version = '0.0.5';
