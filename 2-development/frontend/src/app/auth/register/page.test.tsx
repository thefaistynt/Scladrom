import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RegisterPage from './page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('Register page API integration', () => {
  beforeEach(() => {
    pushMock.mockReset();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('submits registration payload to backend and redirects on success', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
    } as Response);

    render(<RegisterPage />);

    await userEvent.type(screen.getByPlaceholderText('name@example.com'), 'new-client@example.com');
    await userEvent.type(screen.getByPlaceholderText('Иван Иванов'), 'Иван Иванов');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'supersecret');
    await userEvent.type(screen.getAllByPlaceholderText('••••••••')[1], 'supersecret');
    await userEvent.type(screen.getByLabelText(/дата рождения/i), '1990-01-01');
    await userEvent.click(screen.getByLabelText(/мне исполнилось 18 лет/i));
    await userEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'new-client@example.com',
            full_name: 'Иван Иванов',
            password: 'supersecret',
            birth_date: '1990-01-01',
            accepted_terms: true,
          }),
        }),
      );
    });

    expect(await screen.findByText(/аккаунт создан/i)).toBeInTheDocument();
    expect(pushMock).toHaveBeenCalledWith('/auth/login');
  });
});
