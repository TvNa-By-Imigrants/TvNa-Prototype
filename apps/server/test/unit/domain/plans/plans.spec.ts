import { describe, expect, it } from 'vitest';
import {
  mapPlanRows,
  type PlanJoinRow,
} from '../../../../src/domain/plans/plans.ts';

const planDate = new Date('2026-01-01T00:00:00.000Z');

function row(
  overrides: Partial<PlanJoinRow> = {},
): PlanJoinRow {
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

describe('mapPlanRows', () => {
  it('aggregates items under plans and preserves plans without items', () => {
    const result = mapPlanRows([
      row(),
      row({
        item_id: 'item-2',
        place_id: 'place-2',
        position: 1,
        place_name: 'Museum',
        place_lat: '11.56',
        place_lng: '104.92',
      }),
      row({
        plan_id: 'plan-2',
        plan_title: 'Quiet day',
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
        place_lat: null,
        place_lng: null,
      }),
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value).toHaveLength(2);
    expect(result.value[0]?.items).toHaveLength(2);
    expect(result.value[0]?.items[0]).toMatchObject({
      id: 'item-1',
      placeId: 'place-1',
      lat: null,
      lng: null,
    });
    expect(result.value[0]?.items[1]).toMatchObject({
      id: 'item-2',
      placeId: 'place-2',
      lat: 11.56,
      lng: 104.92,
    });
    expect(result.value[1]?.items).toEqual([]);
    expect(result.value[0]?.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('returns an internal error for incomplete item rows', () => {
    const result = mapPlanRows([row({ place_name: null })]);

    expect(result).toMatchObject({
      ok: false,
      error: { code: 'INTERNAL_SERVER_ERROR', statusCode: 500 },
    });
  });
});
