# ADR-0014: Tests never read `.env`

- **Status:** Accepted (amends ADR-0010)
- **Date:** 2026-11-13

## Context
A developer ran `npm test` with a real `server/.env` present. `dotenv` loaded `CONTACT_EMAIL=your-project-email@gmail.com`, which overrode the test fixture and failed two tests. Tests must not depend on whoever runs them.

## Decision
`src/config/env.ts` calls `dotenv.config()` only when `NODE_ENV !== 'test'`. `tests/helpers/env.ts` (a Jest `setupFiles` entry) sets every value the app needs, including `CONTACT_EMAIL`, so tests are identical on every machine and can never use real secrets or send real mail.

## Alternatives considered
- Keep loading `.env` and override more variables in the test setup: fragile, one forgotten variable leaks again.

## Consequences
- Adding a new required env var means also adding it to `tests/helpers/env.ts`, otherwise the Zod env check fails fast in tests (intentional).
