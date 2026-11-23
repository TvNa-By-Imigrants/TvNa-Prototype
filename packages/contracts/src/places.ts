import { z } from 'zod';

export const priceLevelSchema = z.enum(['$', '$$', '$$$', '$$$$']);
export type PriceLevel = z.infer<typeof priceLevelSchema>;

export const placeCategorySchema = z.enum(['visit', 'eat', 'cafe', 'stay']);
export type PlaceCategory = z.infer<typeof placeCategorySchema>;

export const placeSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  nameKm: z.string().nullable().optional(),
  area: z.string().min(1),
  province: z.string().default('Phnom Penh'),
  category: z.string().min(1),
  categoryId: z.string().min(1),
  image: z.string(),
  photos: z.array(z.string()).default([]),
  rating: z.number().nullable().optional(),
  reviewsCount: z.number().int().nullable().optional(),
  priceLevel: priceLevelSchema.nullable().optional(),
  hours: z.string().nullable().optional(),
  is24Hours: z.boolean().default(false),
  isPartnered: z.boolean().default(false),
  address: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
});
export type Place = z.infer<typeof placeSchema>;

export const placesQuerySchema = z.object({
  q: z.string().trim().optional(),
  category_id: z.string().trim().optional(),
  price_level: priceLevelSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  is_partnered: z
    .preprocess((val) => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return undefined;
    }, z.boolean().optional())
    .optional(),
});
export type PlacesQuery = z.infer<typeof placesQuerySchema>;
export type PlacesQueryInput = z.input<typeof placesQuerySchema>;

export const paginatedPlacesSchema = z.object({
  items: z.array(placeSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(0),
});
export type PaginatedPlaces = z.infer<typeof paginatedPlacesSchema>;
