import { describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AuthController } from '../../../../src/modules/auth/auth.controller.ts';

type Req = FastifyRequest & {
  user?: { id?: string } | null;
  session?: { session?: { id?: string } } | null;
};

function createController() {
  const service = {
    listSessions: vi.fn(),
    revokeSession: vi.fn(),
  };
  return { controller: new AuthController(service as never), service };
}

describe('AuthController.listSessions', () => {
  it('returns sessions and marks the current one', async () => {
    const { controller, service } = createController();
    const expiresAt = new Date('2030-01-01T00:00:00.000Z');
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    service.listSessions.mockResolvedValue([
      { id: 's1', expiresAt, createdAt, ipAddress: null, userAgent: 'ua' },
      { id: 's2', expiresAt, createdAt },
    ]);
    const req = {
      headers: {},
      user: { id: 'u1' },
      session: { session: { id: 's1' } },
    } as unknown as Req;

    const result = await controller.listSessions(req);

    expect(result.sessions[0]).toMatchObject({
      id: 's1',
      isCurrent: true,
      userAgent: 'ua',
    });
    expect(result.sessions[1]).toMatchObject({
      id: 's2',
      isCurrent: false,
      userAgent: null,
    });
    expect(service.listSessions).toHaveBeenCalledWith(req.headers);
  });

  it('rejects anonymous requests', async () => {
    const { controller } = createController();
    const req = { headers: {}, user: null } as unknown as Req;

    await expect(controller.listSessions(req)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});

describe('AuthController.revokeSession', () => {
  it('delegates to the service and returns the outcome', async () => {
    const { controller, service } = createController();
    service.revokeSession.mockResolvedValue(true);
    const req = {
      headers: { cookie: 'a' },
      user: { id: 'u1' },
    } as unknown as Req;

    await expect(controller.revokeSession('s1', req)).resolves.toEqual({
      revoked: true,
    });
    expect(service.revokeSession).toHaveBeenCalledWith('s1', req.headers);
  });
});
