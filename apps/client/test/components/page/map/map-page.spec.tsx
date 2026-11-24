import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MapPage } from '@/components/page/map';
import { LanguageProvider } from '@/i18n';
import { fetchPlaceById } from '@/lib/places-api';
import type { Place } from '@repo/contracts';

vi.mock('@/lib/places-api', () => ({
  fetchPlaceById: vi.fn(),
}));

const mockedFetchPlaceById = vi.mocked(fetchPlaceById);

const place: Place = {
  id: 'coconut-park-cafe',
  name: 'Coconut Park Cafe',
  area: 'Chamkar Mon',
  province: 'Phnom Penh',
  category: 'Park & Cafe',
  categoryId: 'visit',
  image: 'https://example.com/cafe.webp',
  photos: [],
  is24Hours: false,
  isPartnered: true,
  lat: 11.553,
  lng: 104.92,
  tags: [],
};

function renderMapPage(placeId?: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <MapPage placeId={placeId} />
      </QueryClientProvider>
    </LanguageProvider>,
  );
}

describe('MapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('tvna-language', 'en');
  });

  it('shows the selected place, its coordinates and a directions link', async () => {
    mockedFetchPlaceById.mockResolvedValueOnce(place);
    renderMapPage(place.id);

    expect(await screen.findByText('Coconut Park Cafe')).toBeDefined();
    expect(screen.getByText(/Coordinates:/)).toBeDefined();

    const directions = screen.getByRole('link', { name: /get directions/i });
    expect(directions.getAttribute('href')).toContain(
      'destination=11.553%2C104.92',
    );

    await waitFor(() => {
      expect(mockedFetchPlaceById).toHaveBeenCalledWith(place.id);
    });
  });

  it('shows the default map and hint when no place is selected', () => {
    renderMapPage();
    expect(screen.getByText(/pick a place from the list/i)).toBeDefined();
    expect(mockedFetchPlaceById).not.toHaveBeenCalled();
  });
});
