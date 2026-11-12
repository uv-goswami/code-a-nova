# ADR-0003: OpenAPI as the single source of truth

- **Status:** Accepted (extended by ADR-0013: Zod for env, cross-field rules and JWT payload; types generated from this file)
- **Date:** 2026-11-13

## Context
We want Swagger docs, request validation and dropdown lists to never disagree. Writing Joi/Zod schemas AND a separate Swagger file means two things to keep in sync.

## Decision
`server/openapi/openapi.yaml` (OpenAPI 3.0.3) is hand-written first (API-first). At runtime:
1. `express-openapi-validator` validates every `/api` request against it (types, formats, patterns, enums, `additionalProperties: false`, path params).
2. `swagger-ui-express` serves it at `/api/docs`; raw JSON at `/api/openapi.json`.
3. Dropdown enums (College, Course, Branch, YearOfStudy, Domain) are read from it by Mongoose models and `GET /api/meta/options`.
Rules JSON-Schema cannot express (password == confirm, teamMembers.length == teamSize-1, unique emails, link host allow-lists) live in services and return the same error envelope.

## Alternatives considered
- Joi/Zod + swagger-jsdoc: duplicated definitions drift.
- Zod + zod-to-openapi: viable, but YAML contract-first is easier to review and to hand to the frontend.
- Spec in `docs/`: would not ship with the backend deploy (see ADR-0001); `docs/api-schema.md` links to it instead.

## Consequences
Changing a field = editing one YAML file. The spec is validated at boot, so a broken spec fails fast. Response bodies are documented but not runtime-validated (`validateResponses: false`), so response shapes are protected by tests.
