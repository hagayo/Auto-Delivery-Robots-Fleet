import type { EngineStore, StoreEvent } from '@fleetops/sim-engine';
import { RobotsSnapshot } from '@fleetops/sim-engine';
import { Type } from '@sinclair/typebox';
import type { FastifyInstance, FastifyRequest } from 'fastify';

export function registerHttp(app: FastifyInstance, store: EngineStore) {
  // Health
  app.get('/health', () => ({ ok: true }));

  // GET /robots - list snapshot
  app.get('/robots', {
    schema: { response: { 200: RobotsSnapshot } } // optional typing only
  }, () => {
    return { robots: store.getRobots() };
  });

  // GET /events - SSE
  app.get('/events', {
    schema: { querystring: Type.Object({ once: Type.Optional(Type.String()) }) }
  }, (req: FastifyRequest<{ Querystring: { once?: string } }>, reply) => {
    const once = !!req.query.once;

    if (once) {
      // test-friendly: send 1 event then end
      reply.sse({ event: 'ping', data: 'ok' });
      reply.sseContext.source.end();
      return;
    }

    const unsubscribe = store.subscribe((evt: StoreEvent) => {
      reply.sse({ event: `${evt.entity}.${evt.type}`, data: JSON.stringify(evt) });
    });

    req.socket.on('close', () => {
      unsubscribe();
      reply.sseContext.source.end();
    });
  });
}
