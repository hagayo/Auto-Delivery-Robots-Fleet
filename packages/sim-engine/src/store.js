import { cancelMission } from './stateMachine.js';
export class EngineStore {
    robots = new Map();
    missions = new Map();
    listeners = new Set();
    getRobot(id) { return this.robots.get(id); }
    getMission(id) { return this.missions.get(id); }
    removeRobot(id) {
        const r = this.robots.get(id);
        if (!r)
            return;
        this.robots.delete(id);
        this.emit({ entity: 'robot', type: 'remove', data: r });
    }
    removeMission(id) {
        const m = this.missions.get(id);
        if (!m)
            return;
        this.missions.delete(id);
        this.emit({ entity: 'mission', type: 'remove', data: m });
    }
    /** Clear all in-memory data */
    clear() {
        this.robots.clear();
        this.missions.clear();
    }
    subscribe(cb) {
        this.listeners.add(cb);
        return () => this.listeners.delete(cb);
    }
    emit(e) {
        for (const l of this.listeners)
            l(e);
    }
    // Robots
    getRobots() { return [...this.robots.values()]; }
    applyRobot(r) {
        this.robots.set(r.id, r);
        this.emit({ entity: 'robot', type: 'upsert', data: r });
    }
    // Missions
    getMissions() { return [...this.missions.values()]; }
    getMissionById(id) { return this.missions.get(id); }
    applyMission(m) {
        this.missions.set(m.id, m);
        this.emit({ entity: 'mission', type: 'upsert', data: m });
    }
    /** Cancel mission by id and emit event - no-op if not found */
    cancelMissionById(id, now) {
        const cur = this.missions.get(id);
        if (!cur)
            return undefined;
        const next = cancelMission(cur, now);
        if (next !== cur)
            this.applyMission(next);
        return next;
    }
}
