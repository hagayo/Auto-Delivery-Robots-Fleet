import type { TRobot } from '@fleetops/sim-engine';
import request from 'supertest';
import { describe, it, expect } from 'vitest';

import { buildServer } from '../../src/server.js';


describe('GET /robots', () => {
  it('returns empty list then reflects inserted robots', async () => {
    const { app, store } = buildServer();
    await app.ready();  // ensure all plugins/routes are initialized
    
    const res0 = await request(app.server).get('/robots').expect(200);
    expect(res0.body).toEqual({ robots: [] });

    // seed one robot
    const r: TRobot = { id: 'R-1', status: 'idle', missionId: null, batteryPct: 100, lastUpdated: 0 };
    store.applyRobot(r);

    const res1 = await request(app.server).get('/robots').expect(200);
    const body = res1.body as { robots: TRobot[] };
    expect(body.robots.length).toBe(1);
  
    await app.close();
  }, 10000);
});
