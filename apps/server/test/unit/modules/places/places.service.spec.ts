import { describe, expect, it, vi } from 'vitest';
import { PlacesService } from '../../../../src/modules/places/places.service.ts';
import { runEffect, runEffectResult } from '../../../support/effect-test.ts';

function createMockDb(rows: unknown[] = [], count = rows.length) {
  const queryBuilder = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockResolvedValue(rows),
  };

  const countQueryBuilder = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([{ total: count }]),
  };

  const db = {
    select: vi.fn((selection) => {
      if (selection && 'total' in selection) {
        return countQueryBuilder;
      }
      return queryBuilder;
    }),
  };

  return { db, queryBuilder, countQueryBuilder };
}

describe('PlacesService', () => {
  it('searches and paginates places', async () => {
    const mockRow = {
      id: 'place-1',
      name: 'Cafe Lotus',
      nameKm: null,
      area: 'BKK1',
      province: 'Phnom Penh',
      category: 'Cafe',
      categoryId: 'cafe',
      image: '/assets/cafe.webp',
      photos: ['/assets/cafe.webp'],
      rating: 4.5,
      reviewsCount: 50,
      priceLevel: '$$',
      isPartnered: true,
      is24Hours: false,
      tags: ['coffee'],
    };

    const { db } = createMockDb([mockRow], 1);
    const service = new PlacesService(db as never);

    const result = await runEffect(
      service.search({
        q: 'Lotus',
        category_id: 'cafe',
        price_level: '$$',
        page: 1,
        limit: 10,
      }),
    );

    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe('place-1');
  });

  it('fails with validation error on invalid query', async () => {
    const { db } = createMockDb();
    const service = new PlacesService(db as never);

    const result = await runEffectResult(
      service.search({
        price_level: 'invalid-price-level',
      }),
    );

    expect(result._tag).toBe('Failure');
    if (result._tag === 'Failure' && 'code' in result.failure) {
      expect(result.failure.code).toBe('VALIDATION_ERROR');
    }
  });

  it('fetches place by ID', async () => {
    const mockRow = {
      id: 'place-1',
      name: 'Cafe Lotus',
      area: 'BKK1',
      category: 'Cafe',
      categoryId: 'cafe',
      image: '/assets/cafe.webp',
      photos: ['/assets/cafe.webp'],
    };

    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockRow]),
      }),
    };

    const service = new PlacesService(db as never);
    const place = await runEffect(service.getById('place-1'));

    expect(place.id).toBe('place-1');
    expect(place.name).toBe('Cafe Lotus');
  });

  it('returns 404 when place is not found', async () => {
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      }),
    };

    const service = new PlacesService(db as never);
    const result = await runEffectResult(service.getById('non-existent'));

    expect(result._tag).toBe('Failure');
    if (result._tag === 'Failure' && 'code' in result.failure) {
      expect(result.failure.code).toBe('PLACE_NOT_FOUND');
      expect(result.failure.statusCode).toBe(404);
    }
  });
});
