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
