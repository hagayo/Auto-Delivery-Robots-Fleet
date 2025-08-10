import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/services/api', () => ({
  fetchRobots: vi.fn().mockResolvedValue({ robots: [] })
}));
vi.mock('../../src/services/sse', () => ({
  connectEvents: () => ({ close() {} })
}));

import { render } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';

describe('App smoke', () => {
  it('renders heading and table', () => {
    const { getByText, getByRole } = render(<App />);
    expect(getByText('FleetOps Dashboard')).toBeTruthy();
    expect(getByRole('table', { name: /robots/i })).toBeTruthy();
  });
});
