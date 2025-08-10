/**
 * In-memory store API - skeleton only. Implement in Cycle 3.
 */
import type { TRobot, TMission, TMetrics } from './types.js';

export type StoreEvent =
  | { entity: 'robot'; type: 'upsert' | 'remove'; data: TRobot }
  | { entity: 'mission'; type: 'upsert' | 'remove'; data: TMission }
  | { entity: 'metrics'; type: 'snapshot'; data: TMetrics };

export type Unsubscribe = () => void;

export interface Store {
  // Reads
  getRobot(id: string): TRobot | undefined;
  getRobots(): TRobot[];
  getMission(id: string): TMission | undefined;
  getMissions(): TMission[];

  // Writes
  applyRobot(robot: TRobot): void;
  applyMission(mission: TMission): void;
  removeRobot(id: string): void;
  removeMission(id: string): void;
  clear(): void;

  // Events
  subscribe(cb: (evt: StoreEvent) => void): Unsubscribe;
}

/** EngineStore will keep Maps of robots and missions and emit events. */
export class EngineStore implements Store {
  constructor() {}
  getRobot(_id: string): TRobot | undefined { throw new Error('Not implemented'); }
  getRobots(): TRobot[] { throw new Error('Not implemented'); }
  getMission(_id: string): TMission | undefined { throw new Error('Not implemented'); }
  getMissions(): TMission[] { throw new Error('Not implemented'); }
  applyRobot(_robot: TRobot): void { throw new Error('Not implemented'); }
  applyMission(_mission: TMission): void { throw new Error('Not implemented'); }
  removeRobot(_id: string): void { throw new Error('Not implemented'); }
  removeMission(_id: string): void { throw new Error('Not implemented'); }
  clear(): void { throw new Error('Not implemented'); }
  subscribe(_cb: (evt: StoreEvent) => void): Unsubscribe { throw new Error('Not implemented'); }
}
