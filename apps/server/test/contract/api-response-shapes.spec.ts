/// <reference types="vitest" />

import {
  RobotsSnapshot,
  RobotUpdatedEvent,
  AnySseEvent
} from '@fleetops/sim-engine';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';


const ajv = new Ajv.default({ strict: true, allErrors: true });
addFormats.default(ajv);

describe('contract - shapes', () => {
  it('robots snapshot schema validates sample', () => {
    const validate = ajv.compile(RobotsSnapshot);
    const sample = {
      robots: [
        { id: 'R-001', status: 'idle', missionId: null, batteryPct: 93, lastUpdated: Date.now() }
      ]
    };
    expect(validate(sample)).toBe(true);
  });

  it('robot updated SSE event validates sample', () => {
    const validate = ajv.compile(RobotUpdatedEvent);
    const sample = {
      entity: 'robot',
      type: 'updated',
      data: { id: 'R-002', status: 'assigned', missionId: 'M-123', batteryPct: 88, lastUpdated: Date.now() }
    };
    expect(validate(sample)).toBe(true);
  });

  it('any SSE event union rejects unknown entity', () => {
    const validate = ajv.compile(AnySseEvent);
    const bad = { entity: 'foo', type: 'updated', data: {} };
    expect(validate(bad)).toBe(false);
  });
});
