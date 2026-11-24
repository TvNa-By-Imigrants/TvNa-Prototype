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
});
