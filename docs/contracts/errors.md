# REST Error Contract

The REST API returns a consistent error envelope. Clients should localize and
choose behavior using `code`, not the English `message` fallback.

## Error envelope

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    { "path": "name", "message": "Required", "code": "invalid_type" }
  ],
  "timestamp": "2026-01-01T12:00:00.000Z",
  "path": "/api/users",
  "traceId": "req-1"
}
```

`errors` is omitted when there is no field-level detail. Server errors (`5xx`)
never include a stack trace; their message is replaced with a generic one.

## Authentication and validation

- Missing or invalid session: `401 UNAUTHORIZED`.
- Authenticated user without permission: `403 FORBIDDEN`.
- Zod validation errors include `path`, `message`, and issue `code` for each field.
- `path` uses dot notation for nested inputs.

## Error codes

| Code | HTTP | Meaning |
| --- | --- | --- |
| `VALIDATION_ERROR` | 400 | Input failed its boundary schema |
| `FIELD_NOT_EDITABLE` | 400 | A protected field was supplied |
| `BAD_REQUEST` | 400 | Generic invalid request |
| `UNKNOWN_ROLE` | 400 | The supplied role is not configured |
| `NO_DATA` | 400 | An update was submitted with no fields |
| `UNAUTHORIZED` | 401 | Missing or invalid session |
| `SESSION_REVOKED` | 401 | The session was revoked |
| `FORBIDDEN` | 403 | Authenticated but lacking permission |
| `NOT_FOUND` | 404 | Generic missing resource |
| `USER_NOT_FOUND` | 404 | Unknown user id |
| `POKEMON_NOT_FOUND` | 404 | Unknown pokemon name (example feature) |
| `CONFLICT` | 409 | Generic conflict |
| `EMAIL_TAKEN` | 409 | Email already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Unhandled server error (details withheld) |
| `UPSTREAM_UNAVAILABLE` | 502 | An upstream service could not be reached |
| `UPSTREAM_INVALID_RESPONSE` | 502 | An upstream response did not match its schema |

The canonical code list lives in `@repo/contracts` (`ERROR_CODES`). Treat the
HTTP status as a coarse category and switch on `code` for client behavior and
localized copy. Never parse or display server `message` text as a stable key.
