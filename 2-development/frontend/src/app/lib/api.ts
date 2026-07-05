const DEFAULT_API_URL = 'http://localhost:8000';

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  if (typeof (response as Response).json === 'function') {
    try {
      return (await (response as Response).json()) as T;
    } catch {
      // Ignore JSON parsing errors and fall back to text handling.
    }
  }

  if (typeof (response as Response).text === 'function') {
    const text = await (response as Response).text();
    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return null;
    }
  }

  return null;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T | null> {
  const headers = new Headers(init.headers ?? {});

  if (init.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  const payload = await parseJsonResponse<T>(response);

  if (!response.ok) {
    const detail =
      typeof payload === 'object' && payload && 'detail' in payload
        ? String((payload as { detail?: unknown }).detail ?? '')
        : '';

    throw new Error(detail || 'Запрос к API завершился ошибкой');
  }

  return payload as T;
}
