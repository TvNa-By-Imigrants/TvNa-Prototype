import { describe, expect, it } from 'vitest';
import {
  calculatePagination,
  mapPlaceRow,
  validatePlacesQuery,
} from '../../../../src/domain/places/places.ts';

describe('domain places', () => {
  describe('validatePlacesQuery', () => {
    it('succeeds with valid query params', () => {
      const result = validatePlacesQuery({
        q: 'coffee',
        category_id: 'cafe',
        price_level: '$$',
        page: '1',
        limit: '15',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({
          q: 'coffee',
          category_id: 'cafe',
          price_level: '$$',
          page: 1,
          limit: 15,
        });
      }
    });

    it('returns error when price level is invalid', () => {
      const result = validatePlacesQuery({
        price_level: 'invalid-price',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
        expect(result.error.statusCode).toBe(400);
      }
    });
  });

  describe('calculatePagination', () => {
    it('calculates total pages and offsets accurately', () => {
      expect(calculatePagination(45, 1, 20)).toEqual({
        totalPages: 3,
        validPage: 1,
        offset: 0,
      });
      expect(calculatePagination(45, 2, 20)).toEqual({
        totalPages: 3,
        validPage: 2,
        offset: 20,
      });
      expect(calculatePagination(0, 1, 20)).toEqual({
        totalPages: 0,
        validPage: 1,
        offset: 0,
      });
    });
  });

  describe('mapPlaceRow', () => {
    it('maps database camelCase and snake_case rows to wire Place', () => {
      const result = mapPlaceRow({
        id: 'tsutaya',
        name: 'Tatsuya Bookstore Cafe',
        area: 'BKK1',
        category: 'Cafe',
        category_id: 'cafe',
        image: '/assets/tsutaya.webp',
        price_level: '$$',
        rating: 4.8,
        reviews_count: 100,
        is_partnered: true,
        tags: ['coffee'],
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('tsutaya');
        expect(result.value.categoryId).toBe('cafe');
        expect(result.value.priceLevel).toBe('$$');
        expect(result.value.isPartnered).toBe(true);
        expect(result.value.is24Hours).toBe(false);
      }
    });
  });
});
