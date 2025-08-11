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
