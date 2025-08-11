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
