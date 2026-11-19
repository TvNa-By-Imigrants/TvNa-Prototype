import { Effect } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import type { HttpException } from '@nestjs/common';
import { PokemonController } from '../../../../src/modules/pokemon/pokemon.controller.ts';
import { domainError } from '../../../../src/domain/shared/errors.ts';

function createController() {
  const service = {
    getByName: vi.fn(),
    list: vi.fn(),
  };
  return { controller: new PokemonController(service as never), service };
}

describe('PokemonController', () => {
  it('returns a pokemon from the service', async () => {
    const { controller, service } = createController();
    service.getByName.mockReturnValue(
      Effect.succeed({ id: 25, name: 'pikachu', types: ['electric'] }),
    );

    await expect(controller.findOne('pikachu')).resolves.toEqual({
      id: 25,
      name: 'pikachu',
      types: ['electric'],
    });
    expect(service.getByName).toHaveBeenCalledWith('pikachu');
  });

  it('parses pagination query parameters', async () => {
    const { controller, service } = createController();
    service.list.mockReturnValue(
      Effect.succeed({ count: 0, items: [{ name: 'a', url: 'https://a.test' }] }),
    );

    await expect(controller.list('10', '5')).resolves.toEqual({
      count: 0,
      items: [{ name: 'a', url: 'https://a.test' }],
    });
    expect(service.list).toHaveBeenCalledWith(10, 5);
  });

  it('uses service defaults when pagination parameters are absent', async () => {
    const { controller, service } = createController();
    service.list.mockReturnValue(Effect.succeed({ count: 0, items: [] }));

    await controller.list();

    expect(service.list).toHaveBeenCalledWith(undefined, undefined);
  });

  it('surfaces a domain failure as an HTTP exception', async () => {
    const { controller, service } = createController();
    service.getByName.mockReturnValue(
      Effect.fail(domainError('POKEMON_NOT_FOUND', 'Pokemon not found', 404)),
    );

    try {
      await controller.findOne('missing');
      throw new Error('Expected the controller to reject');
    } catch (error) {
      const response = (error as HttpException).getResponse();
      expect(response).toMatchObject({
        code: 'POKEMON_NOT_FOUND',
        message: 'Pokemon not found',
      });
      expect((error as HttpException).getStatus()).toBe(404);
    }
  });
});
