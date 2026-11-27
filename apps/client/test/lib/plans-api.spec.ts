import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '@/lib/api';
import {
  createPlan,
  deletePlan,
  fetchPlanById,
  fetchPlans,
  fetchSharedPlan,
  sharePlan,
  updatePlan,
} from '@/lib/plans-api';

vi.mock('@/lib/api', () => ({
  apiRequest: vi.fn(),
}));

const mockedApiRequest = vi.mocked(apiRequest);

const plan = {
  id: 'plan-1',
  title: 'A day out',
  items: [
    {
      id: 'item-1',
      placeId: 'place-1',
      order: 0,
      placeName: 'Cafe',
      nameKm: null,
      area: 'BKK1',
      image: '/cafe.webp',
      lat: 11.55,
      lng: 104.92,
      startTime: '09:00',
      endTime: '10:00',
      notes: null,
      tags: ['cafe'],
    },
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const input = {
  title: 'A day out',
  items: [
    {
      placeId: 'place-1',
      startTime: '09:00',
      endTime: '10:00',
      tags: ['cafe'],
    },
  ],
};

describe('plans-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and validates the saved plans list', async () => {
    mockedApiRequest.mockResolvedValueOnce({ plans: [plan] });

    await expect(fetchPlans()).resolves.toEqual({ plans: [plan] });
    expect(mockedApiRequest).toHaveBeenCalledWith('/api/v1/plans');
  });

  it('fetches a saved plan by its encoded id', async () => {
    mockedApiRequest.mockResolvedValueOnce({ plan });

    await expect(fetchPlanById('plan / 1')).resolves.toEqual(plan);
    expect(mockedApiRequest).toHaveBeenCalledWith('/api/v1/plans/plan%20%2F%201');
  });

  it('fetches a shared plan by its token', async () => {
    mockedApiRequest.mockResolvedValueOnce({ plan });

    await expect(fetchSharedPlan('share/token')).resolves.toEqual(plan);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      '/api/v1/plans/shared/share%2Ftoken',
    );
  });

  it('generates and validates a server share token', async () => {
    const share = { token: 'a'.repeat(43) };
    mockedApiRequest.mockResolvedValueOnce(share);

    await expect(sharePlan('plan / 1')).resolves.toEqual(share);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      '/api/v1/plans/plan%20%2F%201/share',
      { method: 'POST' },
    );
  });

  it('creates plans with all itinerary data in order', async () => {
    mockedApiRequest.mockResolvedValueOnce({ plan });

    await expect(createPlan(input)).resolves.toEqual(plan);
    expect(mockedApiRequest).toHaveBeenCalledWith('/api/v1/plans', {
      method: 'POST',
      body: input,
    });
  });

  it('updates and deletes a saved plan', async () => {
    mockedApiRequest
      .mockResolvedValueOnce({ plan })
      .mockResolvedValueOnce(undefined);

    await expect(updatePlan('plan-1', input)).resolves.toEqual(plan);
    await expect(deletePlan('plan-1')).resolves.toBeUndefined();
    expect(mockedApiRequest).toHaveBeenNthCalledWith(
      1,
      '/api/v1/plans/plan-1',
      { method: 'PUT', body: input },
    );
    expect(mockedApiRequest).toHaveBeenNthCalledWith(
      2,
      '/api/v1/plans/plan-1',
      { method: 'DELETE' },
    );
  });

  it('rejects unexpected server payloads', async () => {
    mockedApiRequest.mockResolvedValueOnce({ plans: [{ id: 'bad' }] });

    await expect(fetchPlans()).rejects.toThrow(
      'The server returned an unexpected plans payload',
    );
  });
});
