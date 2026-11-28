import { HttpStatus } from '@nestjs/common';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import { AuthApiController } from '../../../../src/modules/auth/auth-api.controller.ts';

function createController() {
  const service = {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    refreshSession: vi.fn(),
    verifySession: vi.fn(),
  };
  return { controller: new AuthApiController(service as never), service };
}

describe('AuthApiController response status codes', () => {
  it.each(['login', 'logout', 'refresh'] as const)(
    '%s returns 200 OK',
    (method) => {
      expect(
        Reflect.getMetadata(
          HTTP_CODE_METADATA,
          AuthApiController.prototype[method],
        ),
      ).toBe(HttpStatus.OK);
    },
  );
});

describe('AuthApiController request delegation', () => {
  const headers = { authorization: 'Bearer session-token' };
  const request = { headers } as never;

  it('passes registration input and headers to the service', async () => {
    const { controller, service } = createController();
    const input = {
      name: 'Ada',
      email: 'ada@example.com',
      password: 'Password1!',
    };
    const response = {
      token: 'new-session',
      user: { id: 'u1', name: 'Ada', email: 'ada@example.com' },
    };
    service.register.mockResolvedValue(response);

    await expect(controller.register(input, request)).resolves.toBe(response);
    expect(service.register).toHaveBeenCalledWith(input, headers);
  });

  it('passes login input and headers to the service', async () => {
    const { controller, service } = createController();
    const input = { email: 'ada@example.com', password: 'Password1!' };
    const response = {
      token: 'session-token',
      user: { id: 'u1', name: 'Ada', email: 'ada@example.com' },
    };
    service.login.mockResolvedValue(response);

    await expect(controller.login(input, request)).resolves.toBe(response);
    expect(service.login).toHaveBeenCalledWith(input, headers);
  });

  it('passes headers to the logout service', async () => {
    const { controller, service } = createController();
    const response = { success: true as const };
    service.logout.mockResolvedValue(response);

    await expect(controller.logout(request)).resolves.toBe(response);
    expect(service.logout).toHaveBeenCalledWith(headers);
  });

  it('passes headers to the refresh service', async () => {
    const { controller, service } = createController();
    const response = {
      token: 'session-token',
      expiresAt: '2030-01-01T00:00:00.000Z',
      user: { id: 'u1', name: 'Ada', email: 'ada@example.com' },
    };
    service.refreshSession.mockResolvedValue(response);

    await expect(controller.refresh(request)).resolves.toBe(response);
    expect(service.refreshSession).toHaveBeenCalledWith(headers);
  });

  it('passes headers to the session verification service', async () => {
    const { controller, service } = createController();
    const response = {
      token: 'session-token',
      expiresAt: '2030-01-01T00:00:00.000Z',
      user: { id: 'u1', name: 'Ada', email: 'ada@example.com' },
    };
    service.verifySession.mockResolvedValue(response);

    await expect(controller.getSession(request)).resolves.toBe(response);
    expect(service.verifySession).toHaveBeenCalledWith(headers);
  });
});
