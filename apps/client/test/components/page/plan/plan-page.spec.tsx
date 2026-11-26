import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlanPage } from '@/components/page/plan';
import { LanguageProvider } from '@/i18n';
import { PlanProvider, reorderStopList, type PlanStopItem } from '@/lib/plan-context';

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

function renderPlanPage() {
  return render(
    <LanguageProvider>
      <PlanProvider>
        <PlanPage />
      </PlanProvider>
    </LanguageProvider>,
  );
}

describe('PlanPage', () => {
  beforeEach(() => {
    localStorage.setItem('tvna-language', 'en');
    localStorage.removeItem('tvna.plan.stops');
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
});
