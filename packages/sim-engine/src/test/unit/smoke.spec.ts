import { describe, it, expect } from 'vitest';
import { version } from '../../index';

describe('sim-engine smoke', () => {
  it('exports version', () => {
    expect(version).toBeDefined();
  });
});