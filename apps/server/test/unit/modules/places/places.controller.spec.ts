import { Effect } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import type { HttpException } from '@nestjs/common';
import { PlacesController } from '../../../../src/modules/places/places.controller.ts';
import { domainError } from '../../../../src/domain/shared/errors.ts';

function createController() {
  const service = {
    search: vi.fn(),
    getById: vi.fn(),
  };
  return { controller: new PlacesController(service as never), service };
}

describe('PlacesController', () => {
  it('searches places with query params and returns paginated result', async () => {
    const { controller, service } = createController();
    const mockResult = {
      items: [
        {
          id: 'p1',
          name: 'Cafe 1',
          area: 'BKK1',
          category: 'Cafe',
          categoryId: 'cafe',
          image: '/assets/cafe.webp',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    service.search.mockReturnValue(Effect.succeed(mockResult));

    await expect(
      controller.search('cafe', 'cafe', '$$', '1', '20', 'true'),
    ).resolves.toEqual(mockResult);

    expect(service.search).toHaveBeenCalledWith({
      q: 'cafe',
      category_id: 'cafe',
      price_level: '$$',
      page: 1,
      limit: 20,
      is_partnered: true,
    });
  });

  it('retrieves a single place by id', async () => {
    const { controller, service } = createController();
    const mockPlace = {
      id: 'tsutaya',
      name: 'Tatsuya Bookstore Cafe',
      area: 'BKK1',
      category: 'Cafe',
      categoryId: 'cafe',
      image: '/assets/tsutaya.webp',
    };
    service.getById.mockReturnValue(Effect.succeed(mockPlace));

    await expect(controller.findOne('tsutaya')).resolves.toEqual(mockPlace);
    expect(service.getById).toHaveBeenCalledWith('tsutaya');
  });

  it('surfaces domain errors as HTTP exceptions', async () => {
    const { controller, service } = createController();
    service.getById.mockReturnValue(
      Effect.fail(domainError('PLACE_NOT_FOUND', 'Place not found', 404)),
    );

    try {
      await controller.findOne('missing-id');
      throw new Error('Expected controller to throw');
    } catch (err) {
      const response = (err as HttpException).getResponse();
      expect(response).toMatchObject({
        code: 'PLACE_NOT_FOUND',
        message: 'Place not found',
      });
      expect((err as HttpException).getStatus()).toBe(404);
    }
  });
});
