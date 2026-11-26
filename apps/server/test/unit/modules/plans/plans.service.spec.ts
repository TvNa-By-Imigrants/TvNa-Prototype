import { PgDialect } from 'drizzle-orm/pg-core';
import { describe, expect, it, vi } from 'vitest';
import { dayPlan, itineraryItem } from '../../../../src/db/schema.ts';
import { PlansService } from '../../../../src/modules/plans/plans.service.ts';
import { runEffect, runEffectResult } from '../../../support/effect-test.ts';

const dialect = new PgDialect();

const planDate = new Date('2026-01-01T00:00:00.000Z');

function joinedPlanRow(overrides: Record<string, unknown> = {}) {
  return {
    plan_id: 'plan-1',
    plan_title: 'A day out',
    plan_created_at: planDate,
    plan_updated_at: planDate,
    item_id: 'item-1',
    place_id: 'place-1',
    position: 0,
    start_time: '09:00',
    end_time: '10:00',
    notes: null,
    tags: [],
    place_name: 'Cafe',
    place_name_km: null,
    place_area: 'BKK1',
    place_image: '/cafe.webp',
    place_lat: null,
    place_lng: null,
    ...overrides,
  };
}

function createDb(
  executeResults: unknown[],
  onInsert: (table: unknown, values: unknown) => void = () => undefined,
) {
  const execute = vi.fn(async () => executeResults.shift() ?? { rows: [] });
  const insert = vi.fn((table: unknown) => ({
    values: vi.fn(async (values: unknown) => onInsert(table, values)),
  }));
  const tx = { execute, insert };
  const db = {
    execute,
    insert,
    transaction: vi.fn(
      async (callback: (transaction: typeof tx) => Promise<unknown>) =>
        callback(tx),
    ),
  };
  return { db, execute, insert };
}

describe('PlansService ownership', () => {
  it('scopes plan reads to the authenticated owner', async () => {
    const db = { execute: vi.fn().mockResolvedValue({ rows: [] }) };
    const service = new PlansService(db as never);

    const result = await runEffectResult(service.getById('user-1', 'plan-1'));
    const query = dialect.sqlToQuery(db.execute.mock.calls[0]![0]!);

    expect(result).toMatchObject({
      _tag: 'Failure',
      failure: { code: 'NOT_FOUND', statusCode: 404 },
    });
    expect(query.sql).toContain('where p.user_id = $1 and p.id = $2');
    expect(query.params).toEqual(['user-1', 'plan-1']);
  });

  it('scopes plan deletion to the authenticated owner', async () => {
    const db = { execute: vi.fn().mockResolvedValue({ rows: [] }) };
    const service = new PlansService(db as never);

    const result = await runEffectResult(service.delete('user-1', 'plan-1'));
    const query = dialect.sqlToQuery(db.execute.mock.calls[0]![0]!);

    expect(result).toMatchObject({
      _tag: 'Failure',
      failure: { code: 'NOT_FOUND', statusCode: 404 },
    });
    expect(query.sql).toContain('where id = $1 and user_id = $2');
    expect(query.params).toEqual(['plan-1', 'user-1']);
  });
});

describe('PlansService.create', () => {
  it('validates places, inserts the plan and items transactionally, and returns it', async () => {
    const inserts: Array<{ table: unknown; values: unknown }> = [];
    const { db, insert, execute } = createDb(
      [
        { rows: [{ id: 'place-1' }] },
        { rows: [joinedPlanRow()] },
      ],
      (table, values) => inserts.push({ table, values }),
    );
    const service = new PlansService(db as never);

    const plan = await runEffect(
      service.create('user-1', {
        title: 'A day out',
        items: [
          {
            placeId: 'place-1',
            startTime: '09:00',
            endTime: '10:00',
            tags: [],
          },
        ],
      }),
    );

    expect(db.transaction).toHaveBeenCalledOnce();
    expect(execute).toHaveBeenCalledTimes(2);
    expect(insert).toHaveBeenCalledTimes(2);
    expect(inserts[0]).toMatchObject({
      table: dayPlan,
      values: { userId: 'user-1', title: 'A day out' },
    });
    expect(inserts[1]).toMatchObject({
      table: itineraryItem,
      values: [
        {
          placeId: 'place-1',
          position: 0,
          startTime: '09:00',
          endTime: '10:00',
          tags: [],
        },
      ],
    });
    expect(plan).toMatchObject({
      id: 'plan-1',
      title: 'A day out',
      items: [{ placeId: 'place-1', order: 0 }],
    });
  });

  it('rejects unknown places and does not insert a plan', async () => {
    const { db, insert } = createDb([{ rows: [] }]);
    const service = new PlansService(db as never);

    const result = await runEffectResult(
      service.create('user-1', {
        title: 'A day out',
        items: [{ placeId: 'missing-place', tags: [] }],
      }),
    );

    expect(result).toMatchObject({
      _tag: 'Failure',
      failure: {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        message: 'One or more itinerary places do not exist',
      },
    });
    expect(db.transaction).toHaveBeenCalledOnce();
    expect(insert).not.toHaveBeenCalled();
  });
});

describe('PlansService.update', () => {
  it('replaces itinerary items in the same transaction', async () => {
    const inserts: Array<{ table: unknown; values: unknown }> = [];
    const { db, execute } = createDb(
      [
        { rows: [{ id: 'plan-1' }] },
        { rows: [{ id: 'place-2' }] },
        { rows: [] },
        {
          rows: [
            joinedPlanRow({
              plan_title: 'Updated day',
              place_id: 'place-2',
              item_id: 'item-2',
            }),
          ],
        },
      ],
      (table, values) => inserts.push({ table, values }),
    );
    const service = new PlansService(db as never);

    const plan = await runEffect(
      service.update('user-1', 'plan-1', {
        title: 'Updated day',
        items: [{ placeId: 'place-2', startTime: '11:00', tags: ['visit'] }],
      }),
    );

    expect(db.transaction).toHaveBeenCalledOnce();
    expect(execute).toHaveBeenCalledTimes(4);
    expect(inserts).toHaveLength(1);
    expect(inserts[0]).toMatchObject({
      table: itineraryItem,
      values: [{ placeId: 'place-2', startTime: '11:00', tags: ['visit'] }],
    });
    expect(plan).toMatchObject({
      title: 'Updated day',
      items: [{ placeId: 'place-2' }],
    });
  });
});

describe('PlansService.list', () => {
  it('returns multiple plans with their aggregated items', async () => {
    const emptyPlan = joinedPlanRow({
      plan_id: 'plan-2',
      plan_title: 'No stops',
      item_id: null,
      place_id: null,
      position: null,
      start_time: null,
      end_time: null,
      notes: null,
      tags: null,
      place_name: null,
      place_name_km: null,
      place_area: null,
      place_image: null,
    });
    const { db } = createDb([
      {
        rows: [
          joinedPlanRow(),
          joinedPlanRow({
            item_id: 'item-2',
            place_id: 'place-2',
            position: 1,
          }),
          emptyPlan,
        ],
      },
    ]);
    const service = new PlansService(db as never);

    const result = await runEffect(service.list('user-1'));

    expect(result.plans).toHaveLength(2);
    expect(result.plans[0]?.items).toHaveLength(2);
    expect(result.plans[1]?.items).toEqual([]);
  });
});
