import {
  Effect,
} from 'effect';
import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { PlansController } from '../../../../src/modules/plans/plans.controller.ts';

function createController() {
  const service = {
    create: vi.fn(),
    list: vi.fn(),
    getById: vi.fn(),
    getSharedByToken: vi.fn(),
    share: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  return { controller: new PlansController(service as never), service };
}

const request = { user: { id: 'user-1' } } as never;
const input = { title: 'A day out', items: [] };
const plan = {
  id: 'plan-1',
  title: 'A day out',
  items: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('PlansController', () => {
  it('creates plans for the authenticated user', async () => {
    const { controller, service } = createController();
    service.create.mockReturnValue(Effect.succeed(plan));

    await expect(controller.create(input, request)).resolves.toEqual({ plan });
    expect(service.create).toHaveBeenCalledWith('user-1', input);
  });

  it('lists only plans for the authenticated user', async () => {
    const { controller, service } = createController();
    service.list.mockReturnValue(Effect.succeed({ plans: [plan] }));

    await expect(controller.list(request)).resolves.toEqual({ plans: [plan] });
    expect(service.list).toHaveBeenCalledWith('user-1');
  });

  it('passes the authenticated owner to read, update, and delete operations', async () => {
    const { controller, service } = createController();
    service.getById.mockReturnValue(Effect.succeed(plan));
    service.update.mockReturnValue(Effect.succeed(plan));
    service.delete.mockReturnValue(Effect.succeed(undefined));

    await expect(controller.findOne('plan-1', request)).resolves.toEqual({ plan });
    await expect(controller.update('plan-1', input, request)).resolves.toEqual({
      plan,
    });
    await expect(controller.delete('plan-1', request)).resolves.toBeUndefined();

    expect(service.getById).toHaveBeenCalledWith('user-1', 'plan-1');
    expect(service.update).toHaveBeenCalledWith('user-1', 'plan-1', input);
    expect(service.delete).toHaveBeenCalledWith('user-1', 'plan-1');
  });

  it('creates a share token for the authenticated owner', async () => {
    const { controller, service } = createController();
    service.share.mockReturnValue(Effect.succeed({ token: 'a'.repeat(43) }));

    await expect(controller.share('plan-1', request)).resolves.toEqual({
      token: 'a'.repeat(43),
    });
    expect(service.share).toHaveBeenCalledWith('user-1', 'plan-1');
  });

  it('serves shared plans without requiring an authenticated user', async () => {
    const { controller, service } = createController();
    service.getSharedByToken.mockReturnValue(Effect.succeed(plan));

    await expect(controller.findShared('share-token')).resolves.toEqual({
      plan,
    });
    expect(service.getSharedByToken).toHaveBeenCalledWith('share-token');
  });

  it('rejects unauthenticated plan mutations before calling the service', async () => {
    const { controller, service } = createController();

    await expect(controller.update('share-token', input, {} as never)).rejects
      .toBeInstanceOf(UnauthorizedException);
    await expect(controller.delete('share-token', {} as never)).rejects
      .toBeInstanceOf(UnauthorizedException);
    await expect(controller.share('plan-1', {} as never)).rejects
      .toBeInstanceOf(UnauthorizedException);

    expect(service.update).not.toHaveBeenCalled();
    expect(service.delete).not.toHaveBeenCalled();
    expect(service.share).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated access before calling the service', async () => {
    const { controller, service } = createController();

    await expect(controller.list({ user: null } as never)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(service.list).not.toHaveBeenCalled();
  });
});
