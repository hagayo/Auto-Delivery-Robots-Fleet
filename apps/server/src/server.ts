// minimal placeholder to allow future Fastify bootstrap in Cycle 2+
export function createServer() {
  // no-op for Cycle 0
  return { listen: async () => {} };
}