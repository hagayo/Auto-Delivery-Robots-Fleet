import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { buildServer } from '../../src/server.js';
import type { TMission } from '@fleetops/sim-engine';

describe('POST /missions/:id/cancel', () => {
  it('cancels a mission and returns updated state', async () => {
    const { app, store } = buildServer();
    await app.ready();

    const m: TMission = {
      id: 'M-1', robotId: 'R-1', state: 'assigned', createdAt: 0, timeline: [], cancelReason: null
    };
    store.applyMission(m);

    const res = await request(app.server).post('/missions/M-1/cancel').expect(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.mission.state).toBe('canceled');
    expect(res.body.mission.cancelReason).toBe('operator');
    expect(Array.isArray(res.body.mission.timeline)).toBe(true);
    await app.close();
  });
});
