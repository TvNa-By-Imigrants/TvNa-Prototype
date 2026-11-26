import { planSchema, type Plan } from '@repo/contracts';
import { ERROR_CODES } from '../../common/errors/codes.ts';
import { domainError, type DomainError } from '../shared/errors.ts';
import { err, ok, type Result } from '../shared/result.ts';

export type PlanJoinRow = {
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

export function mapPlanRows(rows: PlanJoinRow[]): Result<Plan[], DomainError> {
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

    if (row.item_id === null && row.place_id === null) continue;

    if (
      row.item_id === null ||
      row.place_id === null ||
      row.position === null ||
      row.place_name === null ||
      row.place_area === null ||
      row.place_image === null
    ) {
      return err(
        domainError(
          ERROR_CODES.INTERNAL_SERVER_ERROR,
          'Invalid itinerary item row in database',
          500,
        ),
      );
    }

    plan.items.push({
      id: row.item_id,
      placeId: row.place_id,
      order: row.position,
      placeName: row.place_name,
      nameKm: row.place_name_km,
      area: row.place_area,
      image: row.place_image,
      lat: row.place_lat === null ? null : Number(row.place_lat),
      lng: row.place_lng === null ? null : Number(row.place_lng),
      startTime: row.start_time,
      endTime: row.end_time,
      notes: row.notes,
      tags: row.tags ?? [],
    });
  }

  const parsed = planSchema.array().safeParse([...plans.values()]);
  if (!parsed.success) {
    return err(
      domainError(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        `Invalid plan row in database: ${parsed.error.issues[0]?.message}`,
        500,
      ),
    );
  }

  return ok(parsed.data);
}
