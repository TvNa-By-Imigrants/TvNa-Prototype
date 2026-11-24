import type { Place, PlacesQuery, PaginatedPlaces, PriceLevel } from '@repo/contracts';

export type PlaceRow = {
  id: string;
  name: string;
  nameKm?: string | null;
  area: string;
  province?: string | null;
  category: string;
  categoryId?: string | null;
  image: string;
  photos: string[];
  rating?: number | null;
  reviewsCount?: number | null;
  priceLevel?: string | null;
  hours?: string | null;
  is24Hours?: boolean | null;
  isPartnered?: boolean | null;
  address?: string | null;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
  tags?: string[] | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

export type { Place, PlacesQuery, PaginatedPlaces, PriceLevel };
