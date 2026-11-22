import { Injectable } from '@nestjs/common';
import { Effect } from 'effect';
import { and, count, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import { InjectDrizzle } from '@nest-native/drizzle';
import {
  type PaginatedPlaces,
  type Place,
} from '@repo/contracts';
import { ERROR_CODES } from '../../common/errors/codes.ts';
import type { AppDatabase } from '../../database.ts';
import { place } from '../../db/schema.ts';
import {
  DbFailure,
  tryDb,
  withResilience,
  fromResult,
  type ValidationFailure,
} from '../../common/effect/index.ts';
import { domainError, type DomainError } from '../../domain/shared/errors.ts';
import {
  calculatePagination,
  mapPlaceRow,
  validatePlacesQuery,
} from '../../domain/places/places.ts';

export type PlacesError = DomainError | DbFailure | ValidationFailure;

@Injectable()
export class PlacesService {
  constructor(
    @InjectDrizzle() private readonly db: AppDatabase,
  ) {}

  search(
    rawQuery: unknown,
  ): Effect.Effect<PaginatedPlaces, PlacesError> {
    const self = this;
    return withResilience(
      Effect.gen(function* () {
        const query = yield* fromResult(validatePlacesQuery(rawQuery));

        const conditions: SQL[] = [];

        if (query.q && query.q.length > 0) {
          const pattern = `%${query.q}%`;
          conditions.push(
            or(
              ilike(place.name, pattern),
              ilike(place.nameKm, pattern),
              ilike(place.area, pattern),
            )!,
          );
        }

        if (query.category_id && query.category_id !== 'all') {
          conditions.push(eq(place.categoryId, query.category_id));
        }

        if (query.price_level) {
          conditions.push(eq(place.priceLevel, query.price_level));
        }

        if (query.is_partnered !== undefined) {
          conditions.push(eq(place.isPartnered, query.is_partnered));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const countResult = yield* tryDb(() =>
          self.db
            .select({ total: count() })
            .from(place)
            .where(whereClause),
        );
        const total = Number(countResult[0]?.total ?? 0);

        const { totalPages, offset, validPage } = calculatePagination(
          total,
          query.page,
          query.limit,
        );

        const rows = yield* tryDb(() =>
          self.db
            .select()
            .from(place)
            .where(whereClause)
            .orderBy(
              desc(place.isPartnered),
              desc(place.rating),
              desc(place.createdAt),
            )
            .limit(query.limit)
            .offset(offset),
        );

        const items: Place[] = [];
        for (const row of rows) {
          const mapped = yield* fromResult(mapPlaceRow(row));
          items.push(mapped);
        }

        return {
          items,
          total,
          page: validPage,
          limit: query.limit,
          totalPages,
        };
      }),
      { idempotent: true, timeoutMs: 5000 },
    );
  }

  getById(id: string): Effect.Effect<Place, PlacesError> {
    const self = this;
    return withResilience(
      Effect.gen(function* () {
        if (!id || id.trim().length === 0) {
          return yield* Effect.fail(
            domainError(ERROR_CODES.VALIDATION_ERROR, 'Place ID is required', 400),
          );
        }

        const rows = yield* tryDb(() =>
          self.db
            .select()
            .from(place)
            .where(eq(place.id, id.trim()))
            .limit(1),
        );

        const row = rows[0];
        if (!row) {
          return yield* Effect.fail(
            domainError(ERROR_CODES.PLACE_NOT_FOUND, 'Place not found', 404),
          );
        }

        return yield* fromResult(mapPlaceRow(row));
      }),
      { idempotent: true, timeoutMs: 5000 },
    );
  }
}
