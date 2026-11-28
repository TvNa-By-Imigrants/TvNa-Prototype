import { z } from 'zod';

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const RegisterInputSchema = LoginInputSchema.extend({
  name: z.string().min(1),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const authIdentitySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export const authTokenResponseSchema = z.object({
  token: z.string(),
  user: authIdentitySchema,
});
export type AuthTokenResponse = z.infer<typeof authTokenResponseSchema>;

export const authSessionResponseSchema = authTokenResponseSchema.extend({
  expiresAt: z.string().datetime(),
});
export type AuthSessionResponse = z.infer<typeof authSessionResponseSchema>;

/** Permission strings use the `resource:action` format. */
export const PERMISSION_PATTERN = /^[a-z_]+:[a-z_-]+$/;

export const permissionSchema = z.string().regex(PERMISSION_PATTERN, {
  message: 'Permission must use the `resource:action` format',
});

/** The authenticated principal, as returned by the `me` query. */
export const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  permissions: z.array(permissionSchema),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;
