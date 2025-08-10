import request from 'supertest';
import { describe, it, expect } from 'vitest';

import { buildServer } from '../../src/server.js';

describe('GET /events', () => {
  it('responds with text/event-stream and can end for tests', async () => {
    const { app } = buildServer();
    await app.ready();
    
    const res = await request(app.server)
      .get('/events?once=1')
      .set('accept', 'text/event-stream')
      .expect(200);

    expect(res.headers['content-type']).toMatch(/text\/event-stream/);
  await app.close();
  }, 10000);
});
