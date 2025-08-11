import { Type } from '@sinclair/typebox';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import type { EngineStore, StoreEvent } from '@fleetops/sim-engine';

type HttpOpts = { store: EngineStore };

export const httpPlugin: FastifyPluginCallback<HttpOpts> = (app, opts, done) => {
  const { store } = opts;

  // GET /robots
  const Robot = Type.Object({
    id: Type.String(),
    status: Type.Union([
      Type.Literal('idle'),
      Type.Literal('assigned'),
      Type.Literal('en_route'),
      Type.Literal('delivering'),
      Type.Literal('completed')
    ]),
    missionId: Type.Union([Type.String(), Type.Null()]),
    batteryPct: Type.Number(),
    lastUpdated: Type.Number()
  });
  app.get('/robots', {
    schema: { response: { 200: Type.Object({ robots: Type.Array(Robot) }) } }
  }, async (_req, reply) => reply.send({ robots: store.getRobots() }));

  // GET /events - SSE (send immediate event; end if once=1)
  const EventsQuery = Type.Partial(Type.Object({ once: Type.String() }));
  app.get('/events', {
    schema: { querystring: EventsQuery }
  }, (req: FastifyRequest<{ Querystring: { once?: string } }>, reply) => {
    const once = 'once' in req.query;
    reply.sse({ event: 'ready', data: 'ok' });
    if (once) { reply.sseContext.source.end(); return; }
    const unsub = store.subscribe((evt: StoreEvent) => reply.sse({ data: JSON.stringify(evt) }));
    reply.raw.on('close', unsub);
  });

  // POST /missions/:id/cancel
  const CancelParams = Type.Object({ id: Type.String() });
  app.post('/missions/:id/cancel', { schema: { params: CancelParams } },
    (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const m = store.cancelMissionById(req.params.id, Date.now());
      if (!m) return reply.code(404).send({ ok: false, error: 'not_found' } as any);
      return reply.send({ ok: true, mission: m });
    });

  done();
};

// import type { FastifyInstance, FastifyRequest } from 'fastify';
// import { Type } from '@sinclair/typebox';
// import type { EngineStore, StoreEvent } from '@fleetops/sim-engine';

// export function registerHttp(app: FastifyInstance, store: EngineStore) {
  // // GET /robots
  // const Robot = Type.Object({
    // id: Type.String(),
    // status: Type.Union([
      // Type.Literal('idle'),
      // Type.Literal('assigned'),
      // Type.Literal('en_route'),
      // Type.Literal('delivering'),
      // Type.Literal('completed'),
    // ]),
    // missionId: Type.Union([Type.String(), Type.Null()]),
    // batteryPct: Type.Number(),
    // lastUpdated: Type.Number(),
  // });
  // app.get('/robots', {
    // schema: { response: { 200: Type.Object({ robots: Type.Array(Robot) }) } },
  // }, async (_req, reply) => {
    // return reply.send({ robots: store.getRobots() });
  // });

    // // GET /events - SSE (send immediate event; end if once=1)
    // const EventsQuery = Type.Partial(Type.Object({ once: Type.String() }));
    // app.get('/events', {
      // schema: { querystring: EventsQuery }
    // }, (req: FastifyRequest<{ Querystring: { once?: string } }>, reply) => {
      // const once = 'once' in req.query;

      // // send an immediate event so tests don't wait
      // reply.sse({ event: 'ready', data: 'ok' });

      // if (once) {
        // // end the stream right away for tests
        // // note: fastify-sse-v2 requires explicit end
        // reply.sseContext.source.end();
        // return;
      // }

      // // otherwise keep streaming store events
      // const unsub = store.subscribe((evt: StoreEvent) => {
        // reply.sse({ data: JSON.stringify(evt) });
      // });
      // reply.raw.on('close', unsub);
    // });

  // // GET /events - SSE
  // const EventsQuery = Type.Partial(Type.Object({ once: Type.String() }));
  // app.get('/events', {
    // schema: { querystring: EventsQuery },
  // }, (req: FastifyRequest<{ Querystring: { once?: string } }>, reply) => {
    // const once = 'once' in req.query;
    // const unsub = store.subscribe((evt: StoreEvent) => {
      // reply.sse({ data: JSON.stringify(evt) });
      // if (once) {
        // unsub();
        // // end stream after first event
        // // @ts-expect-error - provided by @fastify/sse-v2
        // reply.sseContext.source.end();
      // }
    // });
    // reply.raw.on('close', unsub);
  // });

  // // POST /missions/:id/cancel
  // const CancelParams = Type.Object({ id: Type.String() });
  // app.post('/missions/:id/cancel', {
    // schema: { params: CancelParams },
  // }, (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
    // const m = store.cancelMissionById(req.params.id, Date.now());
    // if (!m) return reply.code(404).send({ ok: false, error: 'not_found' } as any);
    // return reply.send({ ok: true, mission: m });
  // });
// }
