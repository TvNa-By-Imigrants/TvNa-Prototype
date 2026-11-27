import { Injectable } from '@nestjs/common';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Effect } from 'effect';
import { sql } from 'drizzle-orm';
import { InjectDrizzle } from '@nest-native/drizzle';
import type { Plan, PlanInput, PlanShare, PlansList } from '@repo/contracts';
import { planInputSchema } from '@repo/contracts';
import { extractRows } from '../../common/db.ts';
import {
  DbFailure,
  fromResult,
  parse,
  runInTransaction,
  tryDb,
  withResilience,
  type EffectTransactionClient,
  type ValidationFailure,
} from '../../common/effect/index.ts';
import { ERROR_CODES } from '../../common/errors/codes.ts';
import type { AppDatabase } from '../../database.ts';
import { domainError, type DomainError } from '../../domain/shared/errors.ts';
import { mapPlanRows, type PlanJoinRow } from '../../domain/plans/plans.ts';
import { dayPlan, itineraryItem } from '../../db/schema.ts';

type PlansError = DomainError | DbFailure | ValidationFailure;

function selectPlanRows(
  db: AppDatabase,
  filter: { userId: string; id?: string } | { shareTokenHash: string },
): Effect.Effect<PlanJoinRow[], DbFailure> {
  const condition =
    'userId' in filter
      ? sql`p.user_id = ${filter.userId} ${
          filter.id ? sql`and p.id = ${filter.id}` : sql``
        }`
      : sql`p.share_token_hash = ${filter.shareTokenHash}`;
  return tryDb(() =>
    db.execute(sql`
      select
        p.id as plan_id,
        p.title as plan_title,
        p.created_at as plan_created_at,
        p.updated_at as plan_updated_at,
        i.id as item_id,
        i.place_id,
        i.position,
        i.start_time,
        i.end_time,
        i.notes,
        i.tags,
        pl.name as place_name,
        pl.name_km as place_name_km,
        pl.area as place_area,
        pl.image as place_image,
        pl.lat as place_lat,
        pl.lng as place_lng
      from day_plan p
      left join itinerary_item i on i.plan_id = p.id
      left join place pl on pl.id = i.place_id
      where ${condition}
      order by p.created_at desc, i.position asc
    `),
  ).pipe(
    Effect.map((result) => extractRows<PlanJoinRow>(result)),
  );
}

function hashShareToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class PlansService {
  constructor(@InjectDrizzle() private readonly db: AppDatabase) {}

  create(userId: string, rawInput: unknown): Effect.Effect<Plan, PlansError> {
    const self = this;
    return Effect.gen(function* () {
      const input = yield* parse(planInputSchema, rawInput);
      const id = randomUUID();

      yield* runInTransaction(self.db, (tx) =>
        Effect.gen(function* () {
          yield* self.validatePlaces(tx, input);
          yield* tryDb(() =>
            tx.insert(dayPlan).values({
              id,
              userId,
              title: input.title,
            }),
          );
          yield* self.replaceItems(tx, id, input);
        }),
      );

      return yield* self.getById(userId, id);
    });
  }

  list(userId: string): Effect.Effect<PlansList, PlansError> {
    return withResilience(
      selectPlanRows(this.db, { userId }).pipe(
        Effect.flatMap((rows) =>
          fromResult(mapPlanRows(rows)).pipe(
            Effect.map((plans) => ({ plans })),
          ),
        ),
      ),
      { idempotent: true, timeoutMs: 5000 },
    );
  }

  getById(userId: string, id: string): Effect.Effect<Plan, PlansError> {
    return withResilience(
      selectPlanRows(this.db, { userId, id }).pipe(
        Effect.flatMap((rows) => {
          return fromResult(mapPlanRows(rows)).pipe(
            Effect.flatMap(([plan]) =>
              plan
                ? Effect.succeed(plan)
                : Effect.fail(
                domainError(ERROR_CODES.NOT_FOUND, 'Plan not found', 404),
                  ),
            ),
          );
        }),
      ),
      { idempotent: true, timeoutMs: 5000 },
    );
  }

  getSharedByToken(token: string): Effect.Effect<Plan, PlansError> {
    return withResilience(
      selectPlanRows(this.db, { shareTokenHash: hashShareToken(token) }).pipe(
        Effect.flatMap((rows) =>
          fromResult(mapPlanRows(rows)).pipe(
            Effect.flatMap(([plan]) =>
              plan
                ? Effect.succeed(plan)
                : Effect.fail(
                    domainError(ERROR_CODES.NOT_FOUND, 'Plan not found', 404),
                  ),
            ),
          ),
        ),
      ),
      { idempotent: true, timeoutMs: 5000 },
    );
  }

  share(userId: string, id: string): Effect.Effect<PlanShare, PlansError> {
    const self = this;
    const token = randomBytes(32).toString('base64url');
    const shareTokenHash = hashShareToken(token);

    return Effect.gen(function* () {
      const updated = extractRows<{ id: string }>(
        yield* tryDb(() =>
          self.db.execute(sql`
            update day_plan
            set share_token_hash = ${shareTokenHash}
            where id = ${id} and user_id = ${userId}
            returning id
          `),
        ),
      );
      if (updated.length === 0) {
        return yield* Effect.fail(
          domainError(ERROR_CODES.NOT_FOUND, 'Plan not found', 404),
        );
      }

      return { token };
    });
  }

  update(
    userId: string,
    id: string,
    rawInput: unknown,
  ): Effect.Effect<Plan, PlansError> {
    const self = this;
    return Effect.gen(function* () {
      const input = yield* parse(planInputSchema, rawInput);

      yield* runInTransaction(self.db, (tx) =>
        Effect.gen(function* () {
          const updated = extractRows<{ id: string }>(
            yield* tryDb(() =>
              tx.execute(sql`
                update day_plan
                set title = ${input.title}, updated_at = now()
                where id = ${id} and user_id = ${userId}
                returning id
              `),
            ),
          );
          if (updated.length === 0) {
            return yield* Effect.fail(
              domainError(ERROR_CODES.NOT_FOUND, 'Plan not found', 404),
            );
          }

          yield* self.validatePlaces(tx, input);
          yield* tryDb(() =>
            tx.execute(sql`delete from itinerary_item where plan_id = ${id}`),
          );
          yield* self.replaceItems(tx, id, input);
        }),
      );

      return yield* self.getById(userId, id);
    });
  }

  delete(userId: string, id: string): Effect.Effect<void, PlansError> {
    const self = this;
    return Effect.gen(function* () {
      const deleted = extractRows<{ id: string }>(
        yield* tryDb(() =>
          self.db.execute(sql`
            delete from day_plan
            where id = ${id} and user_id = ${userId}
            returning id
          `),
        ),
      );
      if (deleted.length === 0) {
        return yield* Effect.fail(
          domainError(ERROR_CODES.NOT_FOUND, 'Plan not found', 404),
        );
      }
    });
  }

  private validatePlaces(
    tx: EffectTransactionClient,
    input: PlanInput,
  ): Effect.Effect<void, PlansError> {
    if (input.items.length === 0) return Effect.void;

    return Effect.gen(function* () {
      const rows = extractRows<{ id: string }>(
        yield* tryDb(() =>
          tx.execute(sql`
            select id from place
            where id in (${sql.join(
              input.items.map((item) => sql`${item.placeId}`),
              sql`, `,
            )})
          `),
        ),
      );
      if (rows.length !== input.items.length) {
        return yield* Effect.fail(
          domainError(
            ERROR_CODES.VALIDATION_ERROR,
            'One or more itinerary places do not exist',
            400,
          ),
        );
      }
    });
  }

  private replaceItems(
    tx: EffectTransactionClient,
    planId: string,
    input: PlanInput,
  ): Effect.Effect<void, DbFailure> {
    if (input.items.length === 0) return Effect.void;

    return tryDb(() =>
      tx.insert(itineraryItem).values(
        input.items.map((item, position) => ({
          id: randomUUID(),
          planId,
          placeId: item.placeId,
          position,
          startTime: item.startTime ?? null,
          endTime: item.endTime ?? null,
          notes: item.notes ?? null,
          tags: item.tags,
        })),
      ),
    ).pipe(Effect.asVoid);
  }
}
