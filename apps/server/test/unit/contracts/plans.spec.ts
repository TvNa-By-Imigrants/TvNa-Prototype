import { describe, expect, it } from 'vitest';
import { planInputSchema } from '@repo/contracts';

const validPlan = {
  title: 'A day in Phnom Penh',
  items: [
    { placeId: 'cafe', startTime: '09:00', endTime: '10:00' },
    { placeId: 'museum', startTime: '10:30', endTime: '12:00' },
  ],
};

describe('planInputSchema', () => {
  it('accepts a chronological itinerary', () => {
    expect(planInputSchema.safeParse(validPlan).success).toBe(true);
  });

  it.each([
    {
      title: 'end time must follow start time',
      items: [{ placeId: 'cafe', startTime: '10:00', endTime: '09:00' }],
    },
    {
      title: 'items cannot be out of start-time order',
      items: [
        { placeId: 'cafe', startTime: '11:00' },
        { placeId: 'museum', startTime: '10:00' },
      ],
    },
    {
      title: 'items cannot overlap',
      items: [
        { placeId: 'cafe', startTime: '09:00', endTime: '11:00' },
        { placeId: 'museum', startTime: '10:30', endTime: '12:00' },
      ],
    },
    {
      title: 'items cannot start at the same time',
      items: [
        { placeId: 'cafe', startTime: '09:00' },
        { placeId: 'museum', startTime: '09:00' },
      ],
    },
    {
      title: 'an end time requires a start time',
      items: [{ placeId: 'cafe', endTime: '10:00' }],
    },
    {
      title: 'places cannot be repeated',
      items: [
        { placeId: 'cafe', startTime: '09:00' },
        { placeId: 'cafe', startTime: '10:00' },
      ],
    },
    {
      title: 'times must use 24-hour HH:mm format',
      items: [{ placeId: 'cafe', startTime: '9:00' }],
    },
  ])('rejects invalid plan: $title', (plan) => {
    expect(planInputSchema.safeParse(plan).success).toBe(false);
  });
});
