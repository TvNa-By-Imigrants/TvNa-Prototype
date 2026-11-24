import {
  placesQuerySchema,
  placeSchema,
  type Place,
  type PlacesQuery,
  type PriceLevel,
} from '@repo/contracts';
import { ERROR_CODES } from '../../common/errors/codes.ts';
import { domainError, type DomainError } from '../shared/errors.ts';
import { err, ok, type Result } from '../shared/result.ts';
import type { PlaceRow } from './places.types.ts';

/**
 * Pure domain function to validate and normalize search/filter queries.
 */
export function validatePlacesQuery(
  raw: unknown,
): Result<PlacesQuery, DomainError> {
  const parsed = placesQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return err(
      domainError(
        ERROR_CODES.VALIDATION_ERROR,
        parsed.error.issues[0]?.message ?? 'Invalid places query parameters',
        400,
      ),
    );
  }
  return ok(parsed.data);
}

/**
 * Pure domain function to calculate total pages and clamp bounds.
 */
export function calculatePagination(
  total: number,
  page: number,
  limit: number,
): { totalPages: number; validPage: number; offset: number } {
  const safeTotal = Math.max(0, total);
  const safeLimit = Math.max(1, limit);
  const totalPages = Math.ceil(safeTotal / safeLimit);
  const validPage = Math.max(1, page);
  const offset = (validPage - 1) * safeLimit;
  return { totalPages, validPage, offset };
}

/**
 * Pure domain mapping of a raw database row into the wire contract.
 */
export function mapPlaceRow(row: PlaceRow): Result<Place, DomainError> {
  const candidate = {
    id: row.id,
    name: row.name,
    nameKm: row.nameKm ?? null,
    area: row.area,
    province: row.province ?? 'Phnom Penh',
    category: row.category,
    categoryId: row.categoryId ?? '',
    image: row.image,
    photos: row.photos,
    rating: row.rating !== undefined && row.rating !== null ? Number(row.rating) : null,
    reviewsCount:
      row.reviewsCount !== undefined && row.reviewsCount !== null
        ? Number(row.reviewsCount)
        : null,
    priceLevel: (row.priceLevel ?? null) as PriceLevel | null,
    hours: row.hours ?? null,
    is24Hours: Boolean(row.is24Hours),
    isPartnered: Boolean(row.isPartnered),
    address: row.address ?? null,
    description: row.description ?? null,
    lat: row.lat !== undefined && row.lat !== null ? Number(row.lat) : null,
    lng: row.lng !== undefined && row.lng !== null ? Number(row.lng) : null,
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.createdAt ?? undefined,
    updatedAt: row.updatedAt ?? undefined,
  };

  const parsed = placeSchema.safeParse(candidate);
  if (!parsed.success) {
    return err(
      domainError(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        `Invalid place row in database: ${parsed.error.issues[0]?.message}`,
        500,
      ),
    );
  }

  return ok(parsed.data);
}
