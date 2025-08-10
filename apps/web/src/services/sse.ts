export function connectEvents(onEvent: (ev: MessageEvent) => void) {
  const base = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';
  const es = new EventSource(`${base}/events`);
  es.onmessage = onEvent; // fallback
  // concrete event names emitted by server: "robot.upsert", "robot.remove", "mission.upsert", ...
  es.addEventListener('robot.upsert', (e) => onEvent(e as MessageEvent));
  es.addEventListener('robot.remove', (e) => onEvent(e as MessageEvent));
  return es;
}
