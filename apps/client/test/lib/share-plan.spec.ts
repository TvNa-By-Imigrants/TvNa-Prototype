import { describe, expect, it } from 'vitest';
import { createShareUrl, readSharedPlan } from '@/lib/share-plan';
import type { PlanStopItem } from '@/lib/plan-context';

const stops: PlanStopItem[] = [
  {
    placeId: 'coconut-park-cafe',
    name: 'Coconut Park Cafe',
    nameKm: 'កាហ្វេ សួនដូង កោះពេជ្រ',
    area: 'Chamkar Mon',
    image: 'https://example.com/cafe.webp',
    lat: 11.553,
    lng: 104.92,
    startTime: '09:00',
    endTime: '11:00',
    tags: ['visit', 'cafe'],
  },
];

describe('share-plan', () => {
  it('creates unique URLs that round-trip the plan including Khmer text', () => {
    const first = createShareUrl(stops, 'https://example.com');
    const second = createShareUrl(stops, 'https://example.com');

    expect(first).not.toBe(second);
    expect(first).toMatch(/^https:\/\/example\.com\/shared\/[a-z0-9]{8}\?d=/);

    const payload = new URL(first).searchParams.get('d');
    expect(readSharedPlan(payload)).toEqual(stops);
  });

  it('returns null for missing or corrupt payloads', () => {
    expect(readSharedPlan(null)).toBeNull();
    expect(readSharedPlan('not-valid-base64-%%%')).toBeNull();
  });
});
