import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlanPage } from '@/components/page/plan';
import { LanguageProvider } from '@/i18n';
import { PlanProvider, reorderStopList, type PlanStopItem } from '@/lib/plan-context';
import { ApiRequestError } from '@/lib/api';
import {
  createPlan,
  deletePlan,
  fetchPlanById,
  fetchPlans,
  sharePlan,
  updatePlan,
} from '@/lib/plans-api';

vi.mock('@/lib/permissions', () => ({
  usePermissions: () => ({
    user: { id: 'user-1' },
    isLoading: false,
    permissions: [],
    has: () => false,
  }),
}));

vi.mock('@/lib/plans-api', () => ({
  createPlan: vi.fn(),
  deletePlan: vi.fn(),
  fetchPlanById: vi.fn(),
  fetchPlans: vi.fn(),
  sharePlan: vi.fn(),
  updatePlan: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) => (
    <a {...props}>{children}</a>
  ),
}));

const stopOne: PlanStopItem = {
  placeId: 'coconut-park-cafe',
  name: 'Coconut Park Cafe',
  area: 'Chamkar Mon',
  image: 'https://example.com/cafe.webp',
  lat: 11.553,
  lng: 104.92,
};

const stopTwo: PlanStopItem = {
  placeId: 'tsutaya-bkk1',
  name: 'Tatsuya Bookstore Cafe',
  area: 'BKK1',
  image: 'https://example.com/bookstore.webp',
  lat: 11.5564,
  lng: 104.9282,
};

const savedPlan = {
  id: 'plan-1',
  title: 'Weekend food tour',
  items: [
    {
      id: 'item-2',
      placeId: stopTwo.placeId,
      order: 1,
      placeName: stopTwo.name,
      nameKm: null,
      area: stopTwo.area,
      image: stopTwo.image,
      lat: stopTwo.lat!,
      lng: stopTwo.lng!,
      startTime: '11:00',
      endTime: '12:00',
      notes: null,
      tags: ['cafe'],
    },
    {
      id: 'item-1',
      placeId: stopOne.placeId,
      order: 0,
      placeName: stopOne.name,
      nameKm: null,
      area: stopOne.area,
      image: stopOne.image,
      lat: stopOne.lat!,
      lng: stopOne.lng!,
      startTime: '09:00',
      endTime: '10:00',
      notes: null,
      tags: ['eat'],
    },
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockedCreatePlan = vi.mocked(createPlan);
const mockedDeletePlan = vi.mocked(deletePlan);
const mockedFetchPlanById = vi.mocked(fetchPlanById);
const mockedFetchPlans = vi.mocked(fetchPlans);
const mockedSharePlan = vi.mocked(sharePlan);
const mockedUpdatePlan = vi.mocked(updatePlan);

function renderPlanPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <PlanProvider>
          <PlanPage />
        </PlanProvider>
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

describe('PlanPage', () => {
  beforeEach(() => {
    localStorage.setItem('tvna-language', 'en');
    localStorage.removeItem('tvna.plan.stops');
    vi.clearAllMocks();
    mockedFetchPlans.mockResolvedValue({ plans: [] });
    mockedSharePlan.mockResolvedValue({ token: 'a'.repeat(43) });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the empty state when no stops are saved', () => {
    renderPlanPage();
    expect(screen.getByText(/no places in your plan yet/i)).toBeDefined();
  });

  it('renders saved stops, removes them, and builds a multi-stop directions link', async () => {
    localStorage.setItem(
      'tvna.plan.stops',
      JSON.stringify([stopOne, stopTwo]),
    );
    const user = userEvent.setup();
    renderPlanPage();

    expect(screen.getByText('Coconut Park Cafe')).toBeDefined();
    expect(screen.getByText('Tatsuya Bookstore Cafe')).toBeDefined();

    const directions = screen.getByRole('link', { name: /go now/i });
    expect(directions.getAttribute('href')).toContain('waypoints=');
    expect(directions.getAttribute('href')).toContain('11.5564%2C104.9282');

    await user.click(screen.getAllByRole('button', { name: /remove from plan/i })[0]!);
    expect(screen.getByText('Tatsuya Bookstore Cafe')).toBeDefined();
    expect(screen.queryByText('Coconut Park Cafe')).toBeNull();
  });

  it('reorders stops so numbers and waypoints follow the new order', () => {
    const original = [stopOne, stopTwo];
    const reordered = reorderStopList(
      original,
      stopOne.placeId,
      stopTwo.placeId,
    );

    expect(reordered.map((stop) => stop.placeId)).toEqual([
      stopTwo.placeId,
      stopOne.placeId,
    ]);
    expect(original.map((stop) => stop.placeId)).toEqual([
      stopOne.placeId,
      stopTwo.placeId,
    ]);
    expect(
      reorderStopList(original, 'missing', stopTwo.placeId),
    ).toEqual(original);
  });

  it('exposes a drag handle for each stop', () => {
    localStorage.setItem(
      'tvna.plan.stops',
      JSON.stringify([stopOne, stopTwo]),
    );
    renderPlanPage();
    expect(
      screen.getAllByRole('button', { name: /drag to reorder/i }),
    ).toHaveLength(2);
  });

  it('allows user to assign start and end times', async () => {
    localStorage.setItem(
      'tvna.plan.stops',
      JSON.stringify([stopOne]),
    );
    const user = userEvent.setup();
    renderPlanPage();

    const startInput = screen.getByLabelText(/coconut park cafe start time/i);
    const endInput = screen.getByLabelText(/coconut park cafe end time/i);

    await user.type(startInput, '09:00');
    expect((startInput as HTMLInputElement).value).toBe('09:00');

    await user.type(endInput, '10:30');
    expect((endInput as HTMLInputElement).value).toBe('10:30');
  });

  it('allows user to select and toggle category tags', async () => {
    localStorage.setItem(
      'tvna.plan.stops',
      JSON.stringify([stopOne]),
    );
    const user = userEvent.setup();
    renderPlanPage();

    const cafeTag = screen.getByRole('button', { name: /cafe tag/i });
    expect(cafeTag.getAttribute('aria-pressed')).toBe('false');

    await user.click(cafeTag);
    expect(cafeTag.getAttribute('aria-pressed')).toBe('true');

    await user.click(cafeTag);
    expect(cafeTag.getAttribute('aria-pressed')).toBe('false');
  });

  it('shows inline error when end time occurs before start time', async () => {
    localStorage.setItem(
      'tvna.plan.stops',
      JSON.stringify([stopOne]),
    );
    const user = userEvent.setup();
    renderPlanPage();

    const startInput = screen.getByLabelText(/coconut park cafe start time/i);
    const endInput = screen.getByLabelText(/coconut park cafe end time/i);

    await user.type(startInput, '11:00');
    await user.type(endInput, '10:00');

    expect(
      screen.getByText(/end time must be after start time/i),
    ).toBeDefined();
    expect(startInput.getAttribute('aria-invalid')).toBe('true');
  });

  it('shows inline error when stops are scheduled out of sequence', () => {
    const outOfOrderStopOne: PlanStopItem = {
      ...stopOne,
      startTime: '14:00',
      endTime: '15:00',
    };
    const outOfOrderStopTwo: PlanStopItem = {
      ...stopTwo,
      startTime: '09:00',
      endTime: '10:00',
    };

    localStorage.setItem(
      'tvna.plan.stops',
      JSON.stringify([outOfOrderStopOne, outOfOrderStopTwo]),
    );
    renderPlanPage();

    expect(
      screen.getByText(/scheduled out of sequence: occurs before coconut park cafe/i),
    ).toBeDefined();
    expect(screen.getByText(/schedule conflicts detected/i)).toBeDefined();
  });

  it('shows inline warning when stops have overlapping times', () => {
    const overlappingStopOne: PlanStopItem = {
      ...stopOne,
      startTime: '10:00',
      endTime: '11:30',
    };
    const overlappingStopTwo: PlanStopItem = {
      ...stopTwo,
      startTime: '11:00',
      endTime: '12:30',
    };

    localStorage.setItem(
      'tvna.plan.stops',
      JSON.stringify([overlappingStopOne, overlappingStopTwo]),
    );
    renderPlanPage();

    expect(
      screen.getByText(/time overlap: overlaps with coconut park cafe/i),
    ).toBeDefined();
  });

  it('saves the plan name, places, times, tags, and timeline ordering', async () => {
    localStorage.setItem(
      'tvna.plan.stops',
      JSON.stringify([
        { ...stopOne, startTime: '09:00', endTime: '10:00', tags: ['eat'] },
        { ...stopTwo, startTime: '11:00', endTime: '12:00', tags: ['cafe'] },
      ]),
    );
    mockedCreatePlan.mockResolvedValue(savedPlan);
    const user = userEvent.setup();
    renderPlanPage();

    await user.type(screen.getByLabelText(/plan name/i), 'Weekend food tour');
    await user.click(screen.getByRole('button', { name: /save plan/i }));

    expect(mockedCreatePlan).toHaveBeenCalledWith({
      title: 'Weekend food tour',
      items: [
        {
          placeId: stopOne.placeId,
          startTime: '09:00',
          endTime: '10:00',
          tags: ['eat'],
        },
        {
          placeId: stopTwo.placeId,
          startTime: '11:00',
          endTime: '12:00',
          tags: ['cafe'],
        },
      ],
    });
    expect(await screen.findByText(/plan saved to your account/i)).toBeDefined();
  });

  it('opens a saved plan and restores its timeline order, times, and tags', async () => {
    mockedFetchPlans.mockResolvedValue({ plans: [savedPlan] });
    mockedFetchPlanById.mockResolvedValue(savedPlan);
    mockedUpdatePlan.mockResolvedValue(savedPlan);
    const user = userEvent.setup();
    renderPlanPage();

    await screen.findByRole('option', { name: 'Weekend food tour' });
    await user.selectOptions(
      screen.getByLabelText(/select a saved plan/i),
      'plan-1',
    );
    await user.click(screen.getByRole('button', { name: /open plan/i }));

    expect(await screen.findByText('Coconut Park Cafe')).toBeDefined();
    const timelineStops = screen.getAllByRole('listitem');
    expect(timelineStops[0]?.textContent).toContain('Coconut Park Cafe');
    expect(timelineStops[1]?.textContent).toContain('Tatsuya Bookstore Cafe');
    expect(
      (screen.getByLabelText(/coconut park cafe start time/i) as HTMLInputElement)
        .value,
    ).toBe('09:00');
    expect(
      within(timelineStops[0]!).getByRole('button', { name: /eat tag/i })
        .getAttribute('aria-pressed'),
    ).toBe('true');
    expect(mockedFetchPlanById.mock.calls[0]?.[0]).toBe('plan-1');

    await user.clear(screen.getByLabelText(/coconut park cafe start time/i));
    await user.type(
      screen.getByLabelText(/coconut park cafe start time/i),
      '09:30',
    );
    await user.click(screen.getByRole('button', { name: /save plan/i }));

    expect(mockedUpdatePlan).toHaveBeenCalledWith('plan-1', {
      title: 'Weekend food tour',
      items: [
        {
          placeId: stopOne.placeId,
          startTime: '09:30',
          endTime: '10:00',
          tags: ['eat'],
        },
        {
          placeId: stopTwo.placeId,
          startTime: '11:00',
          endTime: '12:00',
          tags: ['cafe'],
        },
      ],
    });
  });

  it('deletes a selected saved plan after confirmation', async () => {
    mockedFetchPlans
      .mockResolvedValueOnce({ plans: [savedPlan] })
      .mockResolvedValueOnce({ plans: [] });
    mockedDeletePlan.mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    renderPlanPage();

    await screen.findByRole('option', { name: 'Weekend food tour' });
    await user.selectOptions(
      screen.getByLabelText(/select a saved plan/i),
      'plan-1',
    );
    await user.click(screen.getByRole('button', { name: /delete plan/i }));

    expect(mockedDeletePlan.mock.calls[0]?.[0]).toBe('plan-1');
    expect(await screen.findByText(/you haven't saved any plans yet/i))
      .toBeDefined();
  });

  it('shows server field validation errors when saving fails', async () => {
    localStorage.setItem(
      'tvna.plan.stops',
      JSON.stringify([{ ...stopOne, startTime: '11:00', endTime: '10:00' }]),
    );
    mockedCreatePlan.mockRejectedValue(
      new ApiRequestError('Validation failed', 'VALIDATION_ERROR', 400, [
        {
          path: 'items.0.endTime',
          message: 'End time must be after start time',
          code: 'custom',
        },
      ]),
    );
    const user = userEvent.setup();
    renderPlanPage();

    await user.type(screen.getByLabelText(/plan name/i), 'Invalid schedule');
    await user.click(screen.getByRole('button', { name: /save plan/i }));

    const alerts = await screen.findAllByRole('alert');
    expect(
      alerts.some((alert) =>
        alert.textContent?.includes('End time must be after start time'),
      ),
    ).toBe(true);
  });
});
