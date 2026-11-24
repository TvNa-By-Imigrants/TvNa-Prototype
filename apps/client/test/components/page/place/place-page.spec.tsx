import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlacePage } from '@/components/page/place';
import { LanguageProvider } from '@/i18n';
import { PlanProvider } from '@/lib/plan-context';
import { fetchPlaces } from '@/lib/places-api';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/lib/places-api', () => ({
  fetchPlaces: vi.fn(),
  fetchPlaceById: vi.fn(),
}));

const mockedFetchPlaces = vi.mocked(fetchPlaces);

const mockPlace1 = {
  id: 'place-1',
  name: 'Tatsuya Bookstore Cafe',
  area: 'BKK1',
  province: 'Phnom Penh',
  category: 'Bookstore Cafe',
  categoryId: 'cafe',
  image: '/assets/tsutayabookstore.webp',
  photos: ['/assets/tsutayabookstore.webp'],
  rating: 4.8,
  reviewsCount: 342,
  priceLevel: '$$' as const,
  hours: '8:00 AM - 9:00 PM',
  is24Hours: false,
  isPartnered: true,
  tags: ['cafe', 'books'],
};

const mockPlace2 = {
  id: 'place-2',
  name: 'Kaixin Hotpot',
  area: 'Toul Kork',
  province: 'Phnom Penh',
  category: 'Restaurant',
  categoryId: 'eat',
  image: '/assets/kaixin.webp',
  photos: ['/assets/kaixin.webp'],
  rating: 4.7,
  reviewsCount: 520,
  priceLevel: '$$' as const,
  hours: '11:00 AM - 10:00 PM',
  is24Hours: false,
  isPartnered: false,
  tags: ['hotpot', 'dinner'],
};

function renderPlacePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <LanguageProvider>
      <PlanProvider>
        <QueryClientProvider client={queryClient}>
          <PlacePage />
        </QueryClientProvider>
      </PlanProvider>
    </LanguageProvider>,
  );
}

describe('PlacePage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('tvna-language', 'en');
    localStorage.removeItem('tvna.plan.stops');
  });

  it('renders places fetched from the backend API', async () => {
    mockedFetchPlaces.mockResolvedValueOnce({
      items: [mockPlace1, mockPlace2],
      total: 2,
      page: 1,
      limit: 8,
      totalPages: 1,
    });

    renderPlacePage();

    expect(await screen.findByText('Tatsuya Bookstore Cafe')).toBeDefined();
    expect(screen.getByText('Kaixin Hotpot')).toBeDefined();
    expect(mockedFetchPlaces).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 8 }),
    );
  });

  it('filters by category when clicking category chips', async () => {
    mockedFetchPlaces.mockResolvedValue({
      items: [mockPlace1],
      total: 1,
      page: 1,
      limit: 8,
      totalPages: 1,
    });

    const user = userEvent.setup();
    renderPlacePage();

    await screen.findByText('Tatsuya Bookstore Cafe');

    // Click on "Cafe" category filter button
    const cafeButton = screen.getByRole('button', { name: /cafe/i });
    await user.click(cafeButton);

    await waitFor(() => {
      expect(mockedFetchPlaces).toHaveBeenCalledWith(
        expect.objectContaining({ category_id: 'cafe' }),
      );
    });
  });

  it('searches for places when typing into search input', async () => {
    mockedFetchPlaces.mockResolvedValue({
      items: [mockPlace1],
      total: 1,
      page: 1,
      limit: 8,
      totalPages: 1,
    });

    const user = userEvent.setup();
    renderPlacePage();

    await screen.findByText('Tatsuya Bookstore Cafe');

    const searchInput = screen.getByRole('textbox', {
      name: /search by name, area or district…/i,
    });
    await user.type(searchInput, 'Tatsuya');

    await waitFor(
      () => {
        expect(mockedFetchPlaces).toHaveBeenCalledWith(
          expect.objectContaining({ q: 'Tatsuya' }),
        );
      },
      { timeout: 1500 },
    );
  });

  it('handles network error smoothly and allows retry', async () => {
    mockedFetchPlaces.mockRejectedValueOnce(new Error('Network error'));

    renderPlacePage();

    // Verify error state is rendered
    expect(await screen.findByText('Failed to load places')).toBeDefined();
    expect(
      screen.getByText(
        'Unable to load places right now. Please check your network and try again.',
      ),
    ).toBeDefined();

    // Now mock success for retry
    mockedFetchPlaces.mockResolvedValueOnce({
      items: [mockPlace1],
      total: 1,
      page: 1,
      limit: 8,
      totalPages: 1,
    });

    const user = userEvent.setup();
    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);

    expect(await screen.findByText('Tatsuya Bookstore Cafe')).toBeDefined();
  });

  it('displays empty state and allows resetting filters', async () => {
    mockedFetchPlaces.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 8,
      totalPages: 0,
    });

    renderPlacePage();

    expect(
      await screen.findByText('No places match your search'),
    ).toBeDefined();

    const resetButton = screen.getByRole('button', { name: /reset filters/i });
    expect(resetButton).toBeDefined();

    const user = userEvent.setup();
    await user.click(resetButton);

    await waitFor(() => {
      expect(mockedFetchPlaces).toHaveBeenCalledWith(
        expect.objectContaining({ category_id: undefined, q: undefined }),
      );
    });
  });

  it('loads more items when next page is available', async () => {
    mockedFetchPlaces
      .mockResolvedValueOnce({
        items: [mockPlace1],
        total: 2,
        page: 1,
        limit: 1,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        items: [mockPlace2],
        total: 2,
        page: 2,
        limit: 1,
        totalPages: 2,
      });

    renderPlacePage();

    expect(await screen.findByText('Tatsuya Bookstore Cafe')).toBeDefined();
  });
});
