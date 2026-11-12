# ADR-0007: Uniform response and error envelope

- **Status:** Accepted
- **Date:** 2026-11-13

## Context
The React app needs one predictable shape to show success states and field-level errors.

## Decision
Success: `{ success: true, data }`. Failure: `{ success: false, error: { code, message, details? } }`. `code` is a stable UPPER_SNAKE string the UI can switch on (`EMAIL_NOT_VERIFIED`, `OTP_EXPIRED`, ...). `details` is `[{ field, message }]` for validation. A single `errorHandler` converts ApiError, validator errors, Mongo duplicate keys, Mongoose validation, bad JSON and unknown errors; 5xx never leaks internals.

## Alternatives considered
- Plain `{ message }`: UI would have to parse strings.
- RFC 7807 problem+json: heavier than needed.

## Consequences
Every new failure mode needs a code (documented in the OpenAPI responses and `docs/api-schema.md`).
All `/api` responses also send `Cache-Control: no-store` because bodies are per-user and sometimes private (found when browser E2E showed `304 Not Modified` on `/user/me`).
