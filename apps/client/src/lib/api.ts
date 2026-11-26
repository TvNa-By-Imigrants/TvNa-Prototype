import type { ErrorEnvelope, FieldIssue } from '@repo/contracts';

export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

const AUTH_FAILURE_CODES = new Set(['UNAUTHORIZED', 'SESSION_REVOKED']);
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly statusCode?: number,
    readonly errors?: FieldIssue[],
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
  /** Disable the global session-expired redirect for expected 401 responses. */
  redirectOnUnauthorized?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body === undefined ? {} : { 'content-type': 'application/json' }),
      ...options.headers,
    },
    credentials: 'include',
    ...(options.body === undefined
      ? {}
      : { body: JSON.stringify(options.body) }),
  });

  const text = await response.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = undefined;
  }

  if (!response.ok) {
    const envelope = (body ?? {}) as Partial<ErrorEnvelope>;
    if (
      options.redirectOnUnauthorized !== false &&
      (response.status === 401 ||
        (envelope.code !== undefined && AUTH_FAILURE_CODES.has(envelope.code)))
    ) {
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    }
    throw new ApiRequestError(
      envelope.message ?? `API request failed (${response.status})`,
      envelope.code,
      envelope.statusCode ?? response.status,
      envelope.errors,
    );
  }

  if (response.status === 204 || body === undefined) {
    return undefined as T;
  }
  return body as T;
}
