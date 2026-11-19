import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest, AUTH_UNAUTHORIZED_EVENT } from '@/lib/api';

function mockResponse(body: unknown, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status < 400,
      status,
      text: async () => (body === undefined ? '' : JSON.stringify(body)),
    }),
  );
}

function listenForUnauthorized() {
  const listener = vi.fn();
  window.addEventListener(AUTH_UNAUTHORIZED_EVENT, listener);
  return {
    listener,
    dispose: () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, listener),
  };
}

describe('apiRequest', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the response body on success', async () => {
    mockResponse({ ok: true });

    await expect(apiRequest('/api/health')).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(
      '/api/health',
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
  });

  it('sends JSON request bodies', async () => {
    mockResponse({ user: { id: 'u1' } }, 201);

    await apiRequest('/api/users', { method: 'POST', body: { name: 'Test' } });

    expect(fetch).toHaveBeenCalledWith(
      '/api/users',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      }),
    );
  });

  it('signals unauthorized failures so the session is dropped', async () => {
    mockResponse(
      { statusCode: 401, code: 'SESSION_REVOKED', message: 'Revoked' },
      401,
    );
    const { listener, dispose } = listenForUnauthorized();

    await expect(apiRequest('/api/me')).rejects.toMatchObject({
      code: 'SESSION_REVOKED',
      statusCode: 401,
    });
    expect(listener).toHaveBeenCalledTimes(1);
    dispose();
  });

  it('can suppress the global redirect for an expected unauthorized response', async () => {
    mockResponse(
      { statusCode: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' },
      401,
    );
    const { listener, dispose } = listenForUnauthorized();

    await expect(
      apiRequest('/api/me', { redirectOnUnauthorized: false }),
    ).rejects.toMatchObject({ statusCode: 401 });
    expect(listener).not.toHaveBeenCalled();
    dispose();
  });

  it('does not sign out on a forbidden failure', async () => {
    mockResponse({ statusCode: 403, code: 'FORBIDDEN', message: 'Forbidden' }, 403);
    const { listener, dispose } = listenForUnauthorized();

    await expect(apiRequest('/api/users')).rejects.toMatchObject({
      code: 'FORBIDDEN',
      statusCode: 403,
    });
    expect(listener).not.toHaveBeenCalled();
    dispose();
  });
});
