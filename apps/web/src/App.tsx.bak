import React, { useEffect, useReducer } from 'react';
import { RobotsTable } from './components/RobotsTable';
import { connectEvents } from './services/sse';
import { fetchRobots } from './services/api';
import { initialRobots, robotsReducer, list, toRobot } from './state/robots';

export default function App() {
  const [state, dispatch] = useReducer(robotsReducer, initialRobots);

  useEffect(() => {
    let closed = false;

    // initial snapshot
    fetchRobots()
      .then((res) => {
        if (!closed) dispatch({ type: 'snapshot', robots: res.robots.map(toRobot) });
      })
      .catch(console.error);

    // live updates
    const es = connectEvents((e) => {
      try {
        const parsed = JSON.parse((e as MessageEvent).data);
        if (parsed?.entity === 'robot' && parsed?.type === 'upsert') {
          dispatch({ type: 'upsert', robot: toRobot(parsed.data) });
        } else if (parsed?.entity === 'robot' && parsed?.type === 'remove') {
          dispatch({ type: 'remove', robot: toRobot(parsed.data) });
        }
      } catch { /* ignore parse errors */ }
    });

    return () => { closed = true; es.close(); };
  }, []);

  const robots = list(state);
  return (
    <div style={{ padding: 16 }}>
      <h1>FleetOps Dashboard</h1>
      <RobotsTable robots={robots} />
    </div>
  );
}
