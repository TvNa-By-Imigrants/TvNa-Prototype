import { describe, expect, it } from 'vitest';
import {
  placeSchema,
  placesQuerySchema,
  paginatedPlacesSchema,
} from '../src/places.ts';

describe('places contracts', () => {
  it('parses valid place object', () => {
    const raw = {
      id: 'tsutaya-bkk1',
      name: 'Tatsuya Bookstore Cafe',
      nameKm: 'ហាងសៀវភៅ និងកាហ្វេ តាតស៊ូយ៉ា',
      area: 'BKK1',
      province: 'Phnom Penh',
      category: 'Bookstore Cafe',
      categoryId: 'cafe',
      image: '/assets/tsutayabookstore.webp',
      rating: 4.8,
      reviewsCount: 342,
      priceLevel: '$$',
      isPartnered: true,
      tags: ['books', 'coffee'],
    };

    const parsed = placeSchema.parse(raw);
    expect(parsed.id).toBe('tsutaya-bkk1');
    expect(parsed.name).toBe('Tatsuya Bookstore Cafe');
    expect(parsed.priceLevel).toBe('$$');
    expect(parsed.isPartnered).toBe(true);
    expect(parsed.is24Hours).toBe(false);
  });

  it('validates and coerces places query params', () => {
    const parsed = placesQuerySchema.parse({
      q: '  coffee  ',
      category_id: 'cafe',
      price_level: '$$',
      page: '2',
      limit: '10',
      is_partnered: 'true',
    });

    expect(parsed).toEqual({
      q: 'coffee',
      category_id: 'cafe',
      price_level: '$$',
      page: 2,
      limit: 10,
      is_partnered: true,
    });
  });

  it('applies query defaults when page and limit are missing', () => {
    const parsed = placesQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(20);
  });

  it('parses paginated places response', () => {
    const parsed = paginatedPlacesSchema.parse({
      items: [
        {
          id: 'test-1',
          name: 'Test Place',
          area: 'BKK1',
          category: 'Cafe',
          categoryId: 'cafe',
          image: '/assets/test.webp',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });

    expect(parsed.total).toBe(1);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.totalPages).toBe(1);
  });
});
