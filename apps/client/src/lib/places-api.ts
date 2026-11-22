import {
  paginatedPlacesSchema,
  placeSchema,
  type PaginatedPlaces,
  type Place,
  type PlacesQueryInput,
} from '@repo/contracts';
import { apiRequest } from './api';

export async function fetchPlaces(
  query: PlacesQueryInput = {},
): Promise<PaginatedPlaces> {
  const searchParams = new URLSearchParams();

  if (query.q) {
    searchParams.set('q', query.q);
  }
  if (query.category_id) {
    searchParams.set('category_id', query.category_id);
  }
  if (query.price_level) {
    searchParams.set('price_level', query.price_level);
  }
  if (query.page !== undefined) {
    searchParams.set('page', String(query.page));
  }
  if (query.limit !== undefined) {
    searchParams.set('limit', String(query.limit));
  }
  if (query.is_partnered !== undefined) {
    searchParams.set('is_partnered', String(query.is_partnered));
  }

  const qs = searchParams.toString();
  const path = `/api/v1/places${qs ? `?${qs}` : ''}`;
  const response = await apiRequest<unknown>(path);

  const parsed = paginatedPlacesSchema.safeParse(response);
  if (!parsed.success) {
    throw new Error('The server returned an unexpected places payload');
  }
  return parsed.data;
}

export async function fetchPlaceById(id: string): Promise<Place> {
  const response = await apiRequest<unknown>(
    `/api/v1/places/${encodeURIComponent(id)}`,
  );

  const parsed = placeSchema.safeParse(response);
  if (!parsed.success) {
    throw new Error('The server returned an unexpected place payload');
  }
  return parsed.data;
}
