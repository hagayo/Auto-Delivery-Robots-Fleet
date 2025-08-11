// Store slice additions to support cancel flow.
// If you already have a store, this will overwrite - a .bak is created first.
import type { TMission, TRobot } from './types.js';
import { cancelMission } from './stateMachine.js';

export type StoreEvent =
  | { entity: 'robot'; type: 'upsert' | 'remove'; data: TRobot }
  | { entity: 'mission'; type: 'upsert' | 'remove'; data: TMission };

export type Unsubscribe = () => void;

export class EngineStore {
  private robots = new Map<string, TRobot>();
  private missions = new Map<string, TMission>();
  private listeners = new Set<(e: StoreEvent) => void>();

  getRobot(id: string) { return this.robots.get(id); }
  getMission(id: string) { return this.missions.get(id); }

  removeRobot(id: string) {
    const r = this.robots.get(id);
    if (!r) return;
    this.robots.delete(id);
    this.emit({ entity: 'robot', type: 'remove', data: r });
  }

  removeMission(id: string) {
    const m = this.missions.get(id);
    if (!m) return;
    this.missions.delete(id);
    this.emit({ entity: 'mission', type: 'remove', data: m });
  }

  /** Clear all in-memory data */
  clear() {
    this.robots.clear();
    this.missions.clear();
  }

  subscribe(cb: (e: StoreEvent) => void): Unsubscribe {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
  private emit(e: StoreEvent) {
    for (const l of this.listeners) l(e);
  }

  // Robots
  getRobots(): TRobot[] { return [...this.robots.values()]; }
  applyRobot(r: TRobot) {
    this.robots.set(r.id, r);
    this.emit({ entity: 'robot', type: 'upsert', data: r });
  }

  // Missions
  getMissions(): TMission[] { return [...this.missions.values()]; }
  getMissionById(id: string): TMission | undefined { return this.missions.get(id); }
  applyMission(m: TMission) {
    this.missions.set(m.id, m);
    this.emit({ entity: 'mission', type: 'upsert', data: m });
  }

  /** Cancel mission by id and emit event - no-op if not found */
  cancelMissionById(id: string, now: number): TMission | undefined {
    const cur = this.missions.get(id);
    if (!cur) return undefined;
    const next = cancelMission(cur, now);
    if (next !== cur) this.applyMission(next);
    return next;
  }
}
