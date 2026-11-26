import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Effect } from 'effect';
import { sql } from 'drizzle-orm';
import { InjectDrizzle } from '@nest-native/drizzle';
import type { Plan, PlanInput, PlansList } from '@repo/contracts';
import { planInputSchema } from '@repo/contracts';
import { extractRows } from '../../common/db.ts';
import {
  DbFailure,
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

type PlansError = DomainError | DbFailure | ValidationFailure;

type PlanJoinRow = {
  plan_id: string;
  plan_title: string;
  plan_created_at: Date | string;
  plan_updated_at: Date | string;
  item_id: string | null;
  place_id: string | null;
  position: number | null;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  tags: string[] | null;
  place_name: string | null;
  place_name_km: string | null;
  place_area: string | null;
  place_image: string | null;
  place_lat: number | string | null;
  place_lng: number | string | null;
};

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapPlanRows(rows: PlanJoinRow[]): Plan[] {
  const plans = new Map<string, Plan>();

  for (const row of rows) {
    let plan = plans.get(row.plan_id);
    if (!plan) {
      plan = {
        id: row.plan_id,
        title: row.plan_title,
        items: [],
        createdAt: toIso(row.plan_created_at),
        updatedAt: toIso(row.plan_updated_at),
      };
      plans.set(plan.id, plan);
    }

    if (row.item_id !== null && row.place_id !== null) {
      plan.items.push({
        id: row.item_id,
        placeId: row.place_id,
        order: row.position!,
        placeName: row.place_name!,
        nameKm: row.place_name_km,
        area: row.place_area!,
        image: row.place_image!,
        lat: row.place_lat === null ? null : Number(row.place_lat),
        lng: row.place_lng === null ? null : Number(row.place_lng),
        startTime: row.start_time,
        endTime: row.end_time,
        notes: row.notes,
        tags: row.tags ?? [],
      });
    }
  }

  return [...plans.values()];
}

function selectPlanRows(
  db: AppDatabase,
  userId: string,
  id?: string,
): Effect.Effect<PlanJoinRow[], DbFailure> {
  const condition = id
    ? sql`and p.id = ${id}`
    : sql``;
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
      where p.user_id = ${userId} ${condition}
      order by p.created_at desc, i.position asc
    `),
  ).pipe(
    Effect.map((result) => extractRows<PlanJoinRow>(result)),
  );
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
            tx.execute(sql`
              insert into day_plan (id, user_id, title, created_at, updated_at)
              values (${id}, ${userId}, ${input.title}, now(), now())
            `),
          );
          yield* self.replaceItems(tx, id, input);
        }),
      );

      return yield* self.getById(userId, id);
    });
  }

  list(userId: string): Effect.Effect<PlansList, PlansError> {
    return withResilience(
      selectPlanRows(this.db, userId).pipe(
        Effect.map((rows) => ({ plans: mapPlanRows(rows) })),
      ),
      { idempotent: true, timeoutMs: 5000 },
    );
  }

  getById(userId: string, id: string): Effect.Effect<Plan, PlansError> {
    return withResilience(
      selectPlanRows(this.db, userId, id).pipe(
        Effect.flatMap((rows) => {
          const plan = mapPlanRows(rows)[0];
          return plan
            ? Effect.succeed(plan)
            : Effect.fail(
                domainError(ERROR_CODES.NOT_FOUND, 'Plan not found', 404),
              );
        }),
      ),
      { idempotent: true, timeoutMs: 5000 },
    );
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

    const values = input.items.map(
      (item, position) => sql`(
        ${randomUUID()},
        ${planId},
        ${item.placeId},
        ${position},
        ${item.startTime ?? null},
        ${item.endTime ?? null},
        ${item.notes ?? null},
        ${item.tags}
      )`,
    );
    return tryDb(() =>
      tx.execute(sql`
        insert into itinerary_item
          (id, plan_id, place_id, position, start_time, end_time, notes, tags)
        values ${sql.join(values, sql`, `)}
      `),
    ).pipe(Effect.asVoid);
  }
}
