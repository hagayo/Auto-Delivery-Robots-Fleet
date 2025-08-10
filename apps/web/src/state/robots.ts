export type Robot = {
  id: string;
  status: 'idle'|'assigned'|'en_route'|'delivering'|'completed';
  missionId: string | null;
  batteryPct: number;
  lastUpdated: number;
};

export type RobotsState = { byId: Record<string, Robot> };

export const initialRobots: RobotsState = { byId: {} };

export type RobotsAction =
  | { type: 'snapshot'; robots: Robot[] }
  | { type: 'upsert'; robot: Robot }
  | { type: 'remove'; robot: Robot };

export function robotsReducer(state: RobotsState, action: RobotsAction): RobotsState {
  switch (action.type) {
    case 'snapshot': {
      const byId: Record<string, Robot> = {};
      for (const r of action.robots) byId[r.id] = toRobot(r);
      return { byId };
    }
    case 'upsert': {
      const byId = { ...state.byId };
      byId[action.robot.id] = toRobot(action.robot);
      return { byId };
    }
    case 'remove': {
      const byId = { ...state.byId };
      delete byId[action.robot.id];
      return { byId };
    }
    default:
      return state;
  }
}
export function toRobot(r: any): Robot {
  // tolerate battery_pct or batteryPct
  const pct = typeof r.batteryPct === 'number' ? r.batteryPct : r.battery_pct ?? 0;
  return { ...r, batteryPct: pct } as Robot;
}

export function list(state: RobotsState): Robot[] {
  return Object.values(state.byId).sort((a, b) => a.id.localeCompare(b.id));
}
