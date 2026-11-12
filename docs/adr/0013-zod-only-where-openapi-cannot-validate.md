# ADR-0013: Zod only where OpenAPI cannot validate at runtime

- **Status:** Accepted (extends ADR-0003)
- **Date:** 2026-11-13

## Context
ADR-0003 made `openapi.yaml` the single source of truth, and `express-openapi-validator` already validates every request's shape (types, formats, enums, lengths, patterns, unknown properties). Adding Zod schemas for the same fields would create a second definition that can drift. But some checks cannot be expressed in OpenAPI/JSON-Schema at runtime, and some data never passes through the OpenAPI validator at all (environment variables, JWT payloads).

## Decision
Zod is used **only** for:
1. **Environment variables** (`src/config/env.ts`): the app refuses to start with a missing or invalid setting and prints every problem. `JWT_SECRET` must be 32+ characters.
2. **Cross-field and policy rules** (`src/validators/rules.ts`): `password == confirmPassword`; `teamMembers.length == teamSize - 1`; unique member emails (none equal to the leader); registration email equals the account email; PPT and demo-video host allow-lists.
3. **JWT payload shape** (`tokenPayloadSchema`): a valid signature is not proof the payload has the expected fields.

Zod issues are converted to the standard error envelope (ADR-0007) with `field`/`message` details. **TypeScript types for request/response bodies are generated from `openapi.yaml`** with `openapi-typescript` (`npm run gen:types` writes `src/types/openapi.d.ts`); `src/types/api.ts` only gives them short names. API shapes are never hand-written twice.

## Alternatives considered
- Zod for every request body (and `zod-to-openapi` for the docs): valid, but the YAML would stop being the source of truth and the generated spec is harder to review.
- No Zod at all: env and cross-field rules would be hand-rolled `if` chains with inconsistent error shapes.

## Consequences
- After editing `openapi.yaml`, run `npm run gen:types` and commit the regenerated `openapi.d.ts`.
- New cross-field rules go in `rules.ts` as Zod schemas, with a test. New field-level rules go in the YAML.
