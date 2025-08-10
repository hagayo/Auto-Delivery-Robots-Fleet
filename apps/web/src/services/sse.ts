export function connect(base?: string) {
  const resolved = base ?? import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';
  return new EventSource(`${resolved}/events`);
}