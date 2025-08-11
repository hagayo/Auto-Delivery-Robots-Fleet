import Fastify from 'fastify';
import cors from '@fastify/cors';
import { FastifySSEPlugin } from 'fastify-sse-v2';
import { EngineStore, WallClock, MissionGenerator } from '@fleetops/sim-engine';
import { httpPlugin } from './http.js';
// import { registerHttp } from './http.js';

export function buildServer() {
  const app = Fastify();

  // register plugins synchronously; Fastify loads them on .ready()/.listen()
  app.register(cors);
  app.register(FastifySSEPlugin);

  const store = new EngineStore();
  const clock = new WallClock({ intervalMs: 1000 });
  const gen = new MissionGenerator(clock, store, { ratePerMinute: 2 });

  // register routes
  // registerHttp(app, store);
  app.register(httpPlugin, { store });

  return { app, store, clock, gen };
}

if (process.env.NODE_ENV !== 'test') {
  const { app } = buildServer();
  app.listen({ port: 3000, host: '0.0.0.0' })
    .then(addr => console.log(`Server on ${addr}`))
    .catch(err => { console.error(err); process.exit(1); });
}
