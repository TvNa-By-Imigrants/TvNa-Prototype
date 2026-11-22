import { describe, expect, it, vi, beforeEach } from 'vitest';
import { apiRequest } from '@/lib/api';
import { fetchPlaces, fetchPlaceById } from '@/lib/places-api';

vi.mock('@/lib/api', () => ({
  apiRequest: vi.fn(),
}));

const mockedApiRequest = vi.mocked(apiRequest);

describe('places-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchPlaces', () => {
    it('calls /api/v1/places with query parameters and returns parsed PaginatedPlaces', async () => {
      const mockResponse = {
        items: [
          {
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
            hours: '8:00 AM - 9:00 PM',
            is24Hours: false,
            isPartnered: true,
            address: 'Street 240, BKK1, Phnom Penh',
            description: 'Cozy atmosphere',
            lat: 11.5564,
            lng: 104.9282,
            tags: ['books', 'cafe'],
          },
        ],
        total: 1,
        page: 1,
        limit: 8,
        totalPages: 1,
      };

      mockedApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await fetchPlaces({
        q: 'tatsuya',
        category_id: 'cafe',
        price_level: '$$',
        page: 1,
        limit: 8,
        is_partnered: true,
      });

      expect(mockedApiRequest).toHaveBeenCalledWith(
        '/api/v1/places?q=tatsuya&category_id=cafe&price_level=%24%24&page=1&limit=8&is_partnered=true',
      );
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.name).toBe('Tatsuya Bookstore Cafe');
      expect(result.total).toBe(1);
    });

    it('handles calls without query parameters', async () => {
      mockedApiRequest.mockResolvedValueOnce({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      const result = await fetchPlaces();

      expect(mockedApiRequest).toHaveBeenCalledWith('/api/v1/places');
      expect(result.items).toEqual([]);
    });

    it('throws when the server response does not match the schema', async () => {
      mockedApiRequest.mockResolvedValueOnce({ invalid: 'data' });

      await expect(fetchPlaces()).rejects.toThrow(
        'The server returned an unexpected places payload',
      );
    });
  });

  describe('fetchPlaceById', () => {
    it('calls /api/v1/places/:id and returns parsed Place', async () => {
      const mockPlace = {
        id: 'place-1',
        name: 'Test Place',
        area: 'BKK1',
        category: 'Cafe',
        categoryId: 'cafe',
        image: '/test.webp',
        is24Hours: false,
        isPartnered: false,
        tags: [],
      };

      mockedApiRequest.mockResolvedValueOnce(mockPlace);

      const result = await fetchPlaceById('place-1');

      expect(mockedApiRequest).toHaveBeenCalledWith('/api/v1/places/place-1');
      expect(result.id).toBe('place-1');
      expect(result.name).toBe('Test Place');
    });

    it('throws when the server returns an unexpected place payload', async () => {
      mockedApiRequest.mockResolvedValueOnce({ missing: 'required fields' });

      await expect(fetchPlaceById('place-1')).rejects.toThrow(
        'The server returned an unexpected place payload',
      );
    });
  });
});
