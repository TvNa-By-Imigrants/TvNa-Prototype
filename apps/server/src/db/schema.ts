import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  real,
  index,
} from 'drizzle-orm/pg-core';

// better-auth tables (https://www.better-auth.com/docs/concepts/database)

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  email: text('email').unique().notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  role: text('role').default('user').notNull(),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    token: text('token').unique().notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    impersonatedBy: text('impersonated_by'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('session_user_id_idx').on(t.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('account_user_id_idx').on(t.userId)],
);

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const place = pgTable(
  'place',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    nameKm: text('name_km'),
    area: text('area').notNull(),
    province: text('province').default('Phnom Penh').notNull(),
    category: text('category').notNull(),
    categoryId: text('category_id').notNull(),
    image: text('image').notNull(),
    rating: real('rating'),
    reviewsCount: integer('reviews_count'),
    priceLevel: text('price_level'),
    hours: text('hours'),
    is24Hours: boolean('is_24_hours').default(false).notNull(),
    isPartnered: boolean('is_partnered').default(false).notNull(),
    address: text('address'),
    description: text('description'),
    lat: real('lat'),
    lng: real('lng'),
    tags: text('tags').array(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('place_name_idx').on(t.name),
    index('place_category_id_idx').on(t.categoryId),
    index('place_price_level_idx').on(t.priceLevel),
    index('place_is_partnered_idx').on(t.isPartnered),
  ],
);

export const schema = {
  user,
  session,
  account,
  verification,
  place,
};
