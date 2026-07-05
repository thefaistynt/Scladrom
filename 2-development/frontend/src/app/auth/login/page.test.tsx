import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LoginPage from './page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('Login page API integration', () => {
  beforeEach(() => {
    pushMock.mockReset();
    window.localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('sends credentials to backend and stores auth state on success', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
    } as Response);

    render(<LoginPage />);

    await userEvent.type(screen.getByPlaceholderText('name@example.com'), 'client@example.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'client@example.com', password: 'secret123' }),
        }),
      );
    });

    expect(window.localStorage.getItem('vertical-auth')).toBe('true');
    expect(await screen.findByText(/вход выполнен/i)).toBeInTheDocument();
    expect(pushMock).toHaveBeenCalledWith('/schedule');
  });

  it('shows a form error when backend rejects credentials', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValueOnce({
      ok: false,
    } as Response);

    render(<LoginPage />);

    await userEvent.type(screen.getByPlaceholderText('name@example.com'), 'client@example.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrong-pass');
    await userEvent.click(screen.getByRole('button', { name: /войти/i }));

    expect(await screen.findByText(/неверный email или пароль/i)).toBeInTheDocument();
    expect(window.localStorage.getItem('vertical-auth')).toBeNull();
  });
});
