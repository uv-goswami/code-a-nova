# ADR-0017: Client-side validation with Zod; the server stays the authority

- **Status:** Accepted (complements ADR-0013)
- **Date:** 2026-11-13

## Context
On the server, OpenAPI validates request shapes at runtime and Zod covers only what OpenAPI cannot (ADR-0013). The browser has no OpenAPI validator, so instant form feedback needs runtime validation of its own.

## Decision
- The client uses **Zod schemas** (`src/lib/validation.ts`) only for immediate feedback in forms (name letters-only, password rules, 10-digit Indian mobile, URL shape, unique member emails, team-size bounds).
- **The server remains the single authority.** Anything the client cannot know is NOT duplicated: dropdown values come from `GET /meta/options` at runtime; link-host rules (Drive/OneDrive/YouTube) are enforced by the API and shown under the field when rejected. This avoids two lists that drift apart.
- Team member box count lives in one function, `memberBoxCount(teamSize)` (ADR-0006), so flipping the rule is a one-line change plus tests.
- Server `details[]` are mapped to inputs by `applyApiError`; anything unmappable appears in a form-level alert.

## Alternatives considered
- Hard-code dropdown lists and hosts in the client: faster to type, silently wrong after any server change.
- No client validation: every typo costs a network round trip.

## Consequences
- Client rules can be slightly looser than the server's. That is intentional; the user still gets a precise server message.
- If a regex changes in `openapi.yaml`, update the matching Zod rule and its test.
