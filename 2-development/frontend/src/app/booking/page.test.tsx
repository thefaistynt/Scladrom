import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import BookingPage from './page';

const pushMock = vi.fn();
const getSearchParam = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: (key: string) => getSearchParam(key) }),
}));

describe('Booking page', () => {
  beforeEach(() => {
    pushMock.mockReset();
    getSearchParam.mockReset();
    getSearchParam.mockImplementation((key: string) => null);
    vi.stubGlobal('fetch', vi.fn());
  });

  it('limits the number of seats to the available spots', async () => {
    getSearchParam.mockImplementation((key: string) => {
      if (key === 'slotId') return '7';
      if (key === 'availableSpots') return '3';
      return null;
    });

    render(<BookingPage />);

    const plusButton = screen.getByRole('button', { name: /увеличить количество мест/i });
    await userEvent.click(plusButton);
    await userEvent.click(plusButton);
    await userEvent.click(plusButton);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(plusButton).toBeDisabled();
  });

  it('submits the booking to the backend only after the offer is accepted', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 42, status: 'confirmed' }),
    } as Response);

    getSearchParam.mockImplementation((key: string) => {
      if (key === 'slotId') return '7';
      if (key === 'availableSpots') return '4';
      if (key === 'accepted') return '1';
      return null;
    });

    render(<BookingPage />);

    await userEvent.click(screen.getByRole('button', { name: /подтвердить запись/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/bookings',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slot_id: 7, seats_count: 1, rental_option: 'self' }),
        }),
      );
    });

    expect(pushMock).toHaveBeenCalledWith('/bookings/42');
  });
});
