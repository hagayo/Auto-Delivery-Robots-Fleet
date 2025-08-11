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
