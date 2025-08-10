import { describe, it, expect } from 'vitest';

import { version } from '../../index.ts';
// import { version } from '../../../src/index.ts';


describe('sim-engine smoke', () => {
  it('exports version', () => {
    expect(version).toBeDefined();
  });
});