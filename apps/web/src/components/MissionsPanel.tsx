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
