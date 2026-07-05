import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SchedulePage from './page';

const apiRequestMock = vi.fn();

vi.mock('@/app/lib/api', () => ({
  apiRequest: (...args: unknown[]) => apiRequestMock(...args),
}));

describe('Schedule page', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    vi.useRealTimers();
  });

  it('shows slots for the current date even when the backend returns dates from today', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-06T12:00:00Z'));

    apiRequestMock.mockResolvedValueOnce([
      {
        id: 1,
        start_time: '2026-07-06T18:00:00',
        end_time: '2026-07-06T19:30:00',
        capacity: 8,
        available_spots: 3,
        instructor_name: 'Илья Петров',
        format_name: 'Болдеринг с инструктажем',
        zone_name: 'Новичковая зона',
        price: 1500,
        status: 'scheduled',
      },
    ]);

    render(<SchedulePage />);

    expect(await screen.findByText('Болдеринг с инструктажем')).toBeInTheDocument();
  });
});
