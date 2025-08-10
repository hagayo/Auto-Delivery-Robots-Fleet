import { describe, it, expect } from 'vitest';

import { EngineStore } from '../../store.ts';

describe('store API shape', () => {
  it('EngineStore exposes basic CRUD and subscribe', () => {
    const s = new EngineStore();
    expect(typeof s.getRobot).toBe('function');
    expect(typeof s.getRobots).toBe('function');
    expect(typeof s.getMission).toBe('function');
    expect(typeof s.getMissions).toBe('function');
    expect(typeof s.applyRobot).toBe('function');
    expect(typeof s.applyMission).toBe('function');
    expect(typeof s.removeRobot).toBe('function');
    expect(typeof s.removeMission).toBe('function');
    expect(typeof s.clear).toBe('function');
    expect(typeof s.subscribe).toBe('function');
  });
});
