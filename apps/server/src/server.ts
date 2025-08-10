import cors from '@fastify/cors';
import { EngineStore, WallClock, MissionGenerator } from '@fleetops/sim-engine';
import Fastify, { type FastifyInstance } from 'fastify';
import { FastifySSEPlugin } from 'fastify-sse-v2';

import { registerHttp } from './http.js';

export interface AppCtx {
  app: FastifyInstance;
  store: EngineStore;
  clock: WallClock;
  gen: MissionGenerator;
}

export function buildServer(): AppCtx {
  const app = Fastify({ logger: false });

  // CORS - allow Vite dev on different origin
  app.register(cors, { origin: true }); // tune later for prod :contentReference[oaicite:3]{index=3}
  app.register(FastifySSEPlugin); // adds reply.sse(...) helpers :contentReference[oaicite:4]{index=4}

  const store = new EngineStore();
  const clock = new WallClock({ intervalMs: 1000 });
  const gen = new MissionGenerator(clock, store, { ratePerMinute: 2 });

  registerHttp(app, store);

  return { app, store, clock, gen };
}
