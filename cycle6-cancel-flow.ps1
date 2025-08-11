# Cycle 6 - Cancel flow - file writer
$files = @{
  "packages/sim-engine/src/stateMachine.ts" = @'
import type { TMission, MissionTimelineEntry } from './types.js';
export function isTerminal(state: TMission['state']): boolean {
  return state === 'completed' || state === 'canceled' || state === 'aborting';
}
function appendTimeline(m: TMission, entry: MissionTimelineEntry): TMission {
  return { ...m, timeline: [...m.timeline, entry] };
}
export function cancelMission(m: TMission, now: number): TMission {
  if (isTerminal(m.state)) return m;
  const withEntry = appendTimeline(m, { state: 'canceled', at: now });
  return { ...withEntry, state: 'canceled', cancelReason: 'operator' };
}
'@;

  "packages/sim-engine/src/store.ts" = @'
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
'@;

  "packages/sim-engine/src/index.ts" = @'
// Re-export public API including cancelMission for consumers like the server.
export type { StoreEvent, Unsubscribe } from './store.js';
export { EngineStore } from './store.js';
export { cancelMission, isTerminal } from './stateMachine.js';
export * from './types.js';
'@;

  "packages/sim-engine/src/test/unit/cancel.spec.ts" = @'
import { describe, it, expect } from 'vitest';
import { cancelMission } from '../../stateMachine.ts';
import type { TMission } from '../../types.ts';

const m = (id='M-1'): TMission => ({
  id, robotId: 'R-1', state: 'assigned', createdAt: 0, timeline: [], cancelReason: null
});

describe('cancelMission', () => {
  it('sets state to canceled and appends timeline', () => {
    const t0 = Date.now();
    const next = cancelMission(m(), t0);
    expect(next.state).toBe('canceled');
    expect(next.cancelReason).toBe('operator');
    expect(next.timeline.at(-1)).toEqual({ state: 'canceled', at: t0 });
  });

  it('is idempotent for terminal states', () => {
    const done = { ...m(), state: 'completed' as const };
    const next = cancelMission(done, Date.now());
    expect(next).toEqual(done);
  });
});
'@;

  "apps/server/src/http.ts" = @'
// Route registrations - adds the cancel endpoint.
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { Type } from '@sinclair/typebox';
import type { EngineStore } from '@fleetops/sim-engine';

export async function registerHttp(app: FastifyInstance, store: EngineStore) {
  // existing routes ...

  // Cancel a mission by id
  const CancelParams = Type.Object({ id: Type.String() });
  const CancelResponse = Type.Object({
    ok: Type.Boolean(),
    mission: Type.Object({
      id: Type.String(),
      robotId: Type.String(),
      state: Type.Union([
        Type.Literal('created'),
        Type.Literal('assigned'),
        Type.Literal('navigating_to_pickup'),
        Type.Literal('at_pickup'),
        Type.Literal('navigating_to_dropoff'),
        Type.Literal('completed'),
        Type.Literal('aborting'),
        Type.Literal('canceled')
      ]),
      createdAt: Type.Number(),
      timeline: Type.Array(Type.Object({
        state: Type.String(),
        at: Type.Number()
      })),
      cancelReason: Type.Union([Type.Literal('operator'), Type.Null()])
    })
  });

  app.post('/missions/:id/cancel', {
    schema: { params: CancelParams, response: { 200: CancelResponse } }
  }, (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const { id } = req.params;
    const now = Date.now();
    const mission = store.cancelMissionById(id, now);
    if (!mission) return reply.code(404).send({ ok: false, error: 'not_found' } as any);
    return reply.send({ ok: true, mission });
  });
}
'@;

  "apps/server/test/integration/missions.cancel.http.spec.ts" = @'
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { buildServer } from '../../src/server.js';
import type { TMission } from '@fleetops/sim-engine';

describe('POST /missions/:id/cancel', () => {
  it('cancels a mission and returns updated state', async () => {
    const { app, store } = buildServer();
    await app.ready();

    const m: TMission = {
      id: 'M-1', robotId: 'R-1', state: 'assigned', createdAt: 0, timeline: [], cancelReason: null
    };
    store.applyMission(m);

    const res = await request(app.server).post('/missions/M-1/cancel').expect(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.mission.state).toBe('canceled');
    expect(res.body.mission.cancelReason).toBe('operator');
    expect(Array.isArray(res.body.mission.timeline)).toBe(true);
    await app.close();
  });
});
'@;

  "apps/web/src/state/missions.ts" = @'
export type Mission = {
  id: string;
  robotId: string;
  state: "created"|"assigned"|"navigating_to_pickup"|"at_pickup"|"navigating_to_dropoff"|"completed"|"aborting"|"canceled";
  createdAt: number;
  timeline: { state: string; at: number }[];
  cancelReason: "operator" | null;
};
export type MissionsState = { byId: Record<string, Mission> };
export const initialMissions: MissionsState = { byId: {} };

export type MissionsAction =
  | { type: "snapshot"; missions: Mission[] }
  | { type: "upsert"; mission: Mission }
  | { type: "remove"; mission: Mission };

export function missionsReducer(state: MissionsState, action: MissionsAction): MissionsState {
  switch (action.type) {
    case "snapshot": {
      const byId: Record<string, Mission> = {};
      for (const m of action.missions) byId[m.id] = m;
      return { byId };
    }
    case "upsert": {
      const byId = { ...state.byId };
      byId[action.mission.id] = action.mission;
      return { byId };
    }
    case "remove": {
      const byId = { ...state.byId };
      delete byId[action.mission.id];
      return { byId };
    }
    default:
      return state;
  }
}

export function list(state: MissionsState): Mission[] {
  return Object.values(state.byId).sort((a, b) => a.id.localeCompare(b.id));
}
'@;

  "apps/web/src/components/MissionsPanel.tsx" = @'
import React from "react";
import type { Mission } from "../state/missions";
import { cancelMission } from "../services/api";

export function MissionsPanel({ missions }: { missions: Mission[] }) {
  async function onCancel(id: string) {
    try {
      await cancelMission(id);
    } catch (e) {
      console.error(e);
    }
  }
  return (
    <section>
      <h2>Missions</h2>
      <table aria-label="missions">
        <thead>
          <tr><th>ID</th><th>Robot</th><th>State</th><th>Cancel</th></tr>
        </thead>
        <tbody>
          {missions.map(m => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.robotId}</td>
              <td>{m.state}</td>
              <td>
                {m.state !== "canceled" && m.state !== "completed" && (
                  <button onClick={() => onCancel(m.id)}>Cancel</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
'@;

  "apps/web/src/services/api.ts" = @'
export function apiBase(): string {
  return import.meta.env.VITE_API_BASE ?? "http://localhost:3000";
}

export async function fetchRobots() {
  const res = await fetch(`${apiBase()}/robots`);
  if (!res.ok) throw new Error(`GET /robots failed ${res.status}`);
  return (await res.json()) as { robots: Array<{
    id: string; status: "idle"|"assigned"|"en_route"|"delivering"|"completed";
    missionId: string | null; battery_pct?: number; batteryPct?: number; lastUpdated: number;
  }> };
}

export async function cancelMission(id: string) {
  const res = await fetch(`${apiBase()}/missions/${encodeURIComponent(id)}/cancel`, { method: "POST" });
  if (!res.ok) throw new Error(`POST /missions/${id}/cancel failed ${res.status}`);
  return (await res.json()) as { ok: boolean };
}
'@;

  "apps/web/src/App.tsx" = @'
import React, { useEffect, useReducer } from "react";
import { RobotsTable } from "./components/RobotsTable";
import { MissionsPanel } from "./components/MissionsPanel";
import { connectEvents } from "./services/sse";
import { fetchRobots } from "./services/api";
import { initialRobots, robotsReducer, list as listRobots, toRobot } from "./state/robots";
import { initialMissions, missionsReducer, list as listMissions } from "./state/missions";

export default function App() {
  const [rState, rDispatch] = useReducer(robotsReducer, initialRobots);
  const [mState, mDispatch] = useReducer(missionsReducer, initialMissions);

  useEffect(() => {
    let closed = false;
    fetchRobots()
      .then(({ robots }) => { if (!closed) rDispatch({ type: "snapshot", robots: robots.map(toRobot) }); })
      .catch(console.error);

    const es = connectEvents((e) => {
      try {
        const parsed = JSON.parse((e as MessageEvent).data);
        if (parsed?.entity === "robot" && parsed?.type === "upsert") {
          rDispatch({ type: "upsert", robot: toRobot(parsed.data) });
        } else if (parsed?.entity === "robot" && parsed?.type === "remove") {
          rDispatch({ type: "remove", robot: toRobot(parsed.data) });
        } else if (parsed?.entity === "mission" && parsed?.type === "upsert") {
          mDispatch({ type: "upsert", mission: parsed.data });
        } else if (parsed?.entity === "mission" && parsed?.type === "remove") {
          mDispatch({ type: "remove", mission: parsed.data });
        }
      } catch { /* ignore */ }
    });

    return () => { closed = true; es.close(); };
  }, []);

  const robots = listRobots(rState);
  const missions = listMissions(mState);

  return (
    <div style={{ padding: 16 }}>
      <h1>FleetOps Dashboard</h1>
      <RobotsTable robots={robots} />
      <MissionsPanel missions={missions} />
    </div>
  );
}
'@;

  "apps/web/tests/unit/missions.reducer.spec.ts" = @'
import { describe, it, expect } from "vitest";
import { missionsReducer, initialMissions, list, type Mission } from "../../src/state/missions";

const m = (id: string): Mission => ({ id, robotId: "R-1", state: "assigned", createdAt: 0, timeline: [], cancelReason: null });

describe("missionsReducer", () => {
  it("upsert and remove", () => {
    const s1 = missionsReducer(initialMissions, { type: "upsert", mission: m("M-1") });
    expect(list(s1).map(x => x.id)).toEqual(["M-1"]);
    const s2 = missionsReducer(s1, { type: "remove", mission: m("M-1") });
    expect(list(s2)).toEqual([]);
  });
});
'@;
}

# write with backup
foreach ($path in $files.Keys) {
  $full = Join-Path -Path (Get-Location) -ChildPath $path
  $dir = Split-Path $full
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  if (Test-Path $full) { Copy-Item $full "$full.bak" -Force }
  $files[$path] | Set-Content -Path $full -Encoding UTF8
}
Write-Host "Cycle 6 cancel flow files written. Backups saved as *.bak when targets existed."
