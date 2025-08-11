// Re-export public API including cancelMission for consumers like the server.
export type { StoreEvent, Unsubscribe } from './store.js';
export { EngineStore } from './store.js';
export { evolveMission, cancelMission, isTerminal, toRobotStatus } from './stateMachine.js';
export { WallClock } from './clock.js';
export { MissionGenerator } from './generator.js';
export * from './types.js';

export const version = '0.0.0';
