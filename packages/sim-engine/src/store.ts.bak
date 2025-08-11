/**
 * In-memory store for robots, missions, and metrics with event emission.
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

export class EngineStore implements Store {
  private robots = new Map<string, TRobot>();
  private missions = new Map<string, TMission>();
  private listeners = new Set<(evt: StoreEvent) => void>();

  constructor() {}

  // Reads
  getRobot(id: string): TRobot | undefined {
    return this.robots.get(id);
  }

  getRobots(): TRobot[] {
    return Array.from(this.robots.values());
  }

  getMission(id: string): TMission | undefined {
    return this.missions.get(id);
  }

  getMissions(): TMission[] {
    return Array.from(this.missions.values());
  }

  // Writes
  applyRobot(robot: TRobot): void {
    this.robots.set(robot.id, robot);
    this.emit({ entity: 'robot', type: 'upsert', data: robot });
  }

  applyMission(mission: TMission): void {
    this.missions.set(mission.id, mission);
    this.emit({ entity: 'mission', type: 'upsert', data: mission });
  }

  removeRobot(id: string): void {
    const existing = this.robots.get(id);
    if (!existing) return;
    this.robots.delete(id);
    this.emit({ entity: 'robot', type: 'remove', data: existing });
  }

  removeMission(id: string): void {
    const existing = this.missions.get(id);
    if (!existing) return;
    this.missions.delete(id);
    this.emit({ entity: 'mission', type: 'remove', data: existing });
  }

  clear(): void {
    this.robots.clear();
    this.missions.clear();
    // clearing is silent by design - callers can stream snapshots if needed
  }

  // Events
  subscribe(cb: (evt: StoreEvent) => void): Unsubscribe {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private emit(evt: StoreEvent): void {
    for (const l of this.listeners) l(evt);
  }
}
