/**
 * Assignment policy - pick an idle robot fairly.
 * Strategy: oldest-idle first, tie-break by id.
 */
import type { TRobot } from './types.js';

export function pickNextRobot(idle: TRobot[]): TRobot | undefined {
  if (idle.length === 0) return undefined;

  // sort by "how long they've been idle"
  // we approximate with older lastUpdated first, then id
  const sorted = [...idle].sort((a, b) => {
    if (a.lastUpdated !== b.lastUpdated) return a.lastUpdated - b.lastUpdated;
    return a.id.localeCompare(b.id);
  });

  return sorted[0];
}
