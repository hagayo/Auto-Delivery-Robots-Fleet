import { buildServer } from './server.js';

const { app, clock, gen } = buildServer();

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

// start engine in runtime, not in tests
if (process.env.NODE_ENV !== 'test') {
  gen.start();
  clock.start();
}

app.listen({ port, host }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
