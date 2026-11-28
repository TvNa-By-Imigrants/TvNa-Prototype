import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../src/auth.ts', () => ({ auth: {} }));

import { Logger } from '@nestjs/common';
import { APIError } from 'better-auth/api';
import { AppAuthService } from '../../../../src/modules/auth/auth.service.ts';

function createService() {
  const api = {
    listSessions: vi.fn(),
    revokeSession: vi.fn(),
    signUpEmail: vi.fn(),
    signInEmail: vi.fn(),
    getSession: vi.fn(),
  };
  const service = new AppAuthService({ api } as never);
  return { service, api };
}

beforeEach(() => {
  vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
});

describe('AppAuthService', () => {
  it('registers a user and returns the Better Auth session token', async () => {
    const { service, api } = createService();
    api.signUpEmail.mockResolvedValue({
      token: 'new-session',
      user: { id: 'u1', name: 'Ada', email: 'ada@b.test' },
    });

    await expect(
      service.register(
        {
          email: 'ada@b.test',
          password: 'Password1!',
          name: 'Ada',
        },
        { 'user-agent': 'test-agent' },
      ),
    ).resolves.toEqual({
      token: 'new-session',
      user: { id: 'u1', name: 'Ada', email: 'ada@b.test' },
    });
    expect(api.signUpEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {
          email: 'ada@b.test',
          password: 'Password1!',
          name: 'Ada',
        },
        headers: expect.any(Headers),
      }),
    );
  });

  it('maps duplicate registration errors to EMAIL_TAKEN', async () => {
    const { service, api } = createService();
    api.signUpEmail.mockRejectedValue(
      APIError.from('UNPROCESSABLE_ENTITY', {
        code: 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL',
        message: 'User exists',
      }),
    );

    await expect(
      service.register(
        { email: 'ada@b.test', password: 'Password1!', name: 'Ada' },
        {},
      ),
    ).rejects.toMatchObject({
      response: { code: 'EMAIL_TAKEN' },
      status: 409,
    });
  });

  it('maps USER_ALREADY_EXISTS registration errors to EMAIL_TAKEN', async () => {
    const { service, api } = createService();
    api.signUpEmail.mockRejectedValue(
      APIError.from('UNPROCESSABLE_ENTITY', {
        code: 'USER_ALREADY_EXISTS',
        message: 'User exists',
      }),
    );

    await expect(
      service.register(
        { email: 'ada@b.test', password: 'Password1!', name: 'Ada' },
        {},
      ),
    ).rejects.toMatchObject({
      response: { code: 'EMAIL_TAKEN' },
      status: 409,
    });
  });

  it('maps invalid login credentials to UNAUTHORIZED', async () => {
    const { service, api } = createService();
    api.signInEmail.mockRejectedValue(
      APIError.from('UNAUTHORIZED', {
        code: 'INVALID_EMAIL_OR_PASSWORD',
        message: 'Invalid credentials',
      }),
    );

    await expect(
      service.login(
        { email: 'ada@b.test', password: 'Password1!' },
        {},
      ),
    ).rejects.toMatchObject({
      response: { code: 'UNAUTHORIZED' },
      status: 401,
    });
  });

  it('logs in and returns the Better Auth session token', async () => {
    const { service, api } = createService();
    api.signInEmail.mockResolvedValue({
      token: 'session-token',
      user: { id: 'u1', name: 'Ada', email: 'ada@b.test' },
    });

    await expect(
      service.login(
        { email: 'ada@b.test', password: 'Password1!' },
        { 'user-agent': 'test-agent' },
      ),
    ).resolves.toEqual({
      token: 'session-token',
      user: { id: 'u1', name: 'Ada', email: 'ada@b.test' },
    });
    expect(api.signInEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { email: 'ada@b.test', password: 'Password1!' },
        headers: expect.any(Headers),
      }),
    );
  });

  it('fails when login does not create a session token', async () => {
    const { service, api } = createService();
    api.signInEmail.mockResolvedValue({
      token: undefined,
      user: { id: 'u1', name: 'Ada', email: 'ada@b.test' },
    });

    await expect(
      service.login(
        { email: 'ada@b.test', password: 'Password1!' },
        {},
      ),
    ).rejects.toMatchObject({
      response: { code: 'INTERNAL_SERVER_ERROR' },
      status: 500,
    });
  });

  it('maps missing credential accounts to UNAUTHORIZED', async () => {
    const { service, api } = createService();
    api.signInEmail.mockRejectedValue(
      APIError.from('UNAUTHORIZED', {
        code: 'CREDENTIAL_ACCOUNT_NOT_FOUND',
        message: 'Credential account not found',
      }),
    );

    await expect(
      service.login(
        { email: 'ada@b.test', password: 'Password1!' },
        {},
      ),
    ).rejects.toMatchObject({
      response: { code: 'UNAUTHORIZED' },
      status: 401,
    });
  });

  it('verifies sessions without relying on the cookie cache', async () => {
    const { service, api } = createService();
    api.getSession.mockResolvedValue({
      session: {
        token: 'session-token',
        expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      },
      user: { id: 'u1', name: 'Ada', email: 'ada@b.test' },
    });

    await expect(service.verifySession({ cookie: 'session=abc' })).resolves.toEqual({
      token: 'session-token',
      expiresAt: '2030-01-01T00:00:00.000Z',
      user: { id: 'u1', name: 'Ada', email: 'ada@b.test' },
    });
    expect(api.getSession).toHaveBeenCalledWith(
      expect.objectContaining({
        query: { disableCookieCache: true },
      }),
    );
  });

  it('refreshes sessions by revalidating against Better Auth', async () => {
    const { service, api } = createService();
    const headers = { cookie: 'session=abc' };
    api.getSession.mockResolvedValue({
      session: {
        token: 'session-token',
        expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      },
      user: { id: 'u1', name: 'Ada', email: 'ada@b.test' },
    });

    await expect(service.refreshSession(headers)).resolves.toEqual({
      token: 'session-token',
      expiresAt: '2030-01-01T00:00:00.000Z',
      user: { id: 'u1', name: 'Ada', email: 'ada@b.test' },
    });
    expect(api.getSession).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.any(Headers),
        query: { disableCookieCache: true },
      }),
    );
  });

  it('rejects expired or missing sessions with UNAUTHORIZED', async () => {
    const { service, api } = createService();
    api.getSession.mockResolvedValue(null);

    await expect(service.verifySession({})).rejects.toMatchObject({
      response: { code: 'UNAUTHORIZED' },
      status: 401,
    });
  });

  it('revokes the verified session token on logout', async () => {
    const { service, api } = createService();
    api.getSession.mockResolvedValue({
      session: {
        token: 'session-token',
        expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      },
      user: { id: 'u1', name: 'Ada', email: 'ada@b.test' },
    });
    api.revokeSession.mockResolvedValue({ status: true });

    await expect(service.logout({ authorization: 'Bearer session-token' })).resolves.toEqual({
      success: true,
    });
    expect(api.revokeSession).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { token: 'session-token' },
        headers: expect.any(Headers),
      }),
    );
  });

  it('lists sessions for the given headers', async () => {
    const { service, api } = createService();
    api.listSessions.mockResolvedValue([{ id: 's1' }]);

    const result = await service.listSessions({ cookie: 'abc' });

    expect(result).toEqual([{ id: 's1' }]);
    expect(api.listSessions).toHaveBeenCalledTimes(1);
  });

  it('does not revoke when the session is not owned by the user', async () => {
    const { service, api } = createService();
    api.listSessions.mockResolvedValue([{ id: 'other', token: 'tok' }]);

    const result = await service.revokeSession('missing', {});

    expect(result).toBe(false);
    expect(api.revokeSession).not.toHaveBeenCalled();
  });

  it('revokes the matching session by token and logs the event', async () => {
    const { service, api } = createService();
    api.listSessions.mockResolvedValue([{ id: 'target', token: 'tok-1' }]);
    api.revokeSession.mockResolvedValue({ status: true });
    const logSpy = vi.spyOn(Logger.prototype, 'log');

    const result = await service.revokeSession('target', { cookie: 'abc' });

    expect(result).toBe(true);
    expect(api.revokeSession).toHaveBeenCalledTimes(1);
    const [args] = api.revokeSession.mock.calls[0];
    expect(args.body).toEqual({ token: 'tok-1' });
    expect(args.headers).toBeInstanceOf(Headers);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('session.revoked'),
    );
  });
});
