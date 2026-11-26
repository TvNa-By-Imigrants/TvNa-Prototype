import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SharedPlanView } from '@/components/page/shared';
import { LanguageProvider } from '@/i18n';
import { usePermissions } from '@/lib/permissions';
import type { PlanStopItem } from '@/lib/plan-context';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock('@/lib/permissions', () => ({
  usePermissions: vi.fn(),
}));

const mockedUsePermissions = vi.mocked(usePermissions);

const stop: PlanStopItem = {
  placeId: 'coconut-park-cafe',
  name: 'Coconut Park Cafe',
  area: 'Chamkar Mon',
  image: 'https://example.com/cafe.webp',
  lat: 11.553,
  lng: 104.92,
  startTime: '09:00',
  endTime: '11:00',
  tags: ['visit'],
};

function renderGuest(stops: PlanStopItem[] | null = [stop]) {
  return render(
    <LanguageProvider>
      <SharedPlanView stops={stops} token="abc12345" />
    </LanguageProvider>,
  );
}

describe('SharedPlanView', () => {
  beforeEach(() => {
    localStorage.setItem('tvna-language', 'en');
    mockedUsePermissions.mockReturnValue({
      user: null,
      permissions: [],
      isLoading: false,
      has: () => false,
    });
  });

  it('renders a read-only timeline with no editing controls', () => {
    renderGuest();

    expect(screen.getByText('Coconut Park Cafe')).toBeDefined();
    expect(screen.getByText('visit')).toBeDefined();
    expect(document.querySelector('input')).toBeNull();
    expect(document.querySelector('[aria-roledescription="sortable"]')).toBeNull();
    expect(screen.queryByRole('button', { name: /remove|reorder|move/i })).toBeNull();

    const directions = screen.getByRole('link', { name: /go now/i });
    expect(directions.getAttribute('href')).toContain('destination=11.553%2C104.92');
  });

  it('shows the sign-up banner for guests and hides it for signed-in users', () => {
    const { unmount } = renderGuest();
    expect(screen.getByText(/want your own plan/i)).toBeDefined();
    unmount();

    mockedUsePermissions.mockReturnValue({
      user: { id: 'user-1', name: 'Member' } as never,
      permissions: [],
      isLoading: false,
      has: () => false,
    });
    renderGuest();
    expect(screen.queryByText(/want your own plan/i)).toBeNull();
  });

  it('shows a fallback for an invalid shared plan', () => {
    renderGuest(null);
    expect(screen.getByText(/this link isn't valid/i)).toBeDefined();
  });
});
