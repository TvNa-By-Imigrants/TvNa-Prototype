import type { Place, PlacesQuery, PaginatedPlaces, PriceLevel } from '@repo/contracts';

export type PlaceRow = {
  id: string;
  name: string;
  name_km?: string | null;
  nameKm?: string | null;
  area: string;
  province?: string | null;
  category: string;
  category_id?: string | null;
  categoryId?: string | null;
  image: string;
  photos?: string[] | null;
  rating?: number | null;
  reviews_count?: number | null;
  reviewsCount?: number | null;
  price_level?: string | null;
  priceLevel?: string | null;
  hours?: string | null;
  is_24_hours?: boolean | null;
  is24Hours?: boolean | null;
  is_partnered?: boolean | null;
  isPartnered?: boolean | null;
  address?: string | null;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
  tags?: string[] | null;
  created_at?: Date | string | null;
  createdAt?: Date | string | null;
  updated_at?: Date | string | null;
  updatedAt?: Date | string | null;
};

export type { Place, PlacesQuery, PaginatedPlaces, PriceLevel };
