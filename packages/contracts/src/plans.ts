import { z } from 'zod';

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must use HH:mm format')
  .nullable()
  .optional();

const planItemInputSchema = z
  .object({
    placeId: z.string().min(1),
    startTime: timeSchema,
    endTime: timeSchema,
    notes: z.string().max(2000).nullable().optional(),
    tags: z.array(z.string().min(1).max(50)).max(20).default([]),
  })
  .strict();

export const planInputSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    items: z.array(planItemInputSchema).max(100),
  })
  .strict()
  .superRefine(({ items }, context) => {
    const seenPlaces = new Set<string>();

    for (const [index, item] of items.entries()) {
      if (seenPlaces.has(item.placeId)) {
        context.addIssue({
          code: 'custom',
          path: ['items', index, 'placeId'],
          message: 'A place can only appear once in a plan',
        });
      }
      seenPlaces.add(item.placeId);

      const start = item.startTime ? toMinutes(item.startTime) : undefined;
      const end = item.endTime ? toMinutes(item.endTime) : undefined;

      if (end !== undefined && start === undefined) {
        context.addIssue({
          code: 'custom',
          path: ['items', index, 'startTime'],
          message: 'Start time is required when an end time is provided',
        });
      }

      if (start !== undefined && end !== undefined && end <= start) {
        context.addIssue({
          code: 'custom',
          path: ['items', index, 'endTime'],
          message: 'End time must be after start time',
        });
      }

      if (start === undefined) continue;

      for (const [previousIndex, previous] of items.slice(0, index).entries()) {
        const previousStart = previous.startTime
          ? toMinutes(previous.startTime)
          : undefined;
        const previousEnd = previous.endTime
          ? toMinutes(previous.endTime)
          : undefined;

        if (previousStart !== undefined && start < previousStart) {
          context.addIssue({
            code: 'custom',
            path: ['items', index, 'startTime'],
            message: `Item must be scheduled after item ${previousIndex + 1}`,
          });
          break;
        }

        if (
          previousStart !== undefined &&
          start === previousStart &&
          (previousEnd === undefined || start < previousEnd)
        ) {
          context.addIssue({
            code: 'custom',
            path: ['items', index, 'startTime'],
            message: `Item overlaps item ${previousIndex + 1}`,
          });
          break;
        }

        if (
          previousStart !== undefined &&
          previousEnd !== undefined &&
          start < previousEnd
        ) {
          context.addIssue({
            code: 'custom',
            path: ['items', index, 'startTime'],
            message: `Item overlaps item ${previousIndex + 1}`,
          });
          break;
        }
      }
    }
  });

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours! * 60 + minutes!;
}

export type PlanInput = z.infer<typeof planInputSchema>;

export const planItemSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  order: z.number().int().min(0),
  placeName: z.string(),
  nameKm: z.string().nullable(),
  area: z.string(),
  image: z.string(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  notes: z.string().nullable(),
  tags: z.array(z.string()),
});
export type PlanItem = z.infer<typeof planItemSchema>;

export const planSchema = z.object({
  id: z.string(),
  title: z.string(),
  items: z.array(planItemSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Plan = z.infer<typeof planSchema>;

export const plansListSchema = z.object({
  plans: z.array(planSchema),
});
export type PlansList = z.infer<typeof plansListSchema>;

export const planShareSchema = z.object({
  token: z.string().length(43),
});
export type PlanShare = z.infer<typeof planShareSchema>;
