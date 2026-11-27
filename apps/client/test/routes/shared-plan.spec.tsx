import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SharedPlanRoute } from '@/routes/shared.$token';
import { LanguageProvider } from '@/i18n';
import { fetchSharedPlan } from '@/lib/plans-api';
import { usePermissions } from '@/lib/permissions';

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
  Link: ({ children, ...props }: React.ComponentProps<'a'>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock('@/lib/plans-api', () => ({
  fetchSharedPlan: vi.fn(),
}));

vi.mock('@/lib/permissions', () => ({
  usePermissions: vi.fn(),
}));

const mockedFetchSharedPlan = vi.mocked(fetchSharedPlan);
const mockedUsePermissions = vi.mocked(usePermissions);

describe('SharedPlanRoute', () => {
  beforeEach(() => {
    localStorage.setItem('tvna-language', 'en');
    mockedFetchSharedPlan.mockResolvedValue({
      id: 'plan-1',
      title: 'Weekend food tour',
      items: [
        {
          id: 'item-1',
          placeId: 'coconut-park-cafe',
          order: 0,
          placeName: 'Coconut Park Cafe',
          nameKm: null,
          area: 'Chamkar Mon',
          image: 'https://example.com/cafe.webp',
          lat: 11.553,
          lng: 104.92,
          startTime: '09:00',
          endTime: '10:00',
          notes: null,
          tags: ['cafe'],
        },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    mockedUsePermissions.mockReturnValue({
      user: null,
      permissions: [],
      isLoading: false,
      has: () => false,
    });
  });

  it('fetches a tokenized public plan and renders its read-only guest view', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <SharedPlanRoute token="share-token" />
        </LanguageProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Coconut Park Cafe')).toBeDefined();
    expect(mockedFetchSharedPlan).toHaveBeenCalledWith('share-token');
    expect(document.querySelector('input')).toBeNull();
    expect(screen.getByText('cafe')).toBeDefined();
  });
});
