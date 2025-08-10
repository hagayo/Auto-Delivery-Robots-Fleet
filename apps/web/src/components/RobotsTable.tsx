import React from 'react';
import type { Robot } from '../state/robots';

export function RobotsTable({ robots }: { robots: Robot[] }) {
  return (
    <table aria-label="robots">
      <thead>
        <tr>
          <th>Robot ID</th><th>Status</th><th>Mission</th><th>Battery</th><th>Updated</th>
        </tr>
      </thead>
      <tbody>
        {robots.map(r => (
          <tr key={r.id}>
            <td>{r.id}</td>
            <td>{r.status}</td>
            <td>{r.missionId ?? '-'}</td>
            <td>{r.batteryPct}%</td>
            <td>{new Date(r.lastUpdated).toLocaleTimeString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
