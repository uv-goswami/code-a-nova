# ADR-0002: Layered backend architecture

- **Status:** Accepted
- **Date:** 2026-11-13

## Context
We need readable, testable code (20 marks for structure) and logic that is not tangled with Express.

## Decision
`routes -> controllers -> services -> models`. Routes only map URL to controller and attach guards. Controllers translate HTTP to a service call and back. **Services contain all business rules and know nothing about `req`/`res`.** Models hold schema only. `app.js` builds the app without listening so tests import it; `server.js` connects the DB and listens.

## Alternatives considered
- Fat controllers: hard to unit test, logic duplicated.
- Full DDD/hexagonal: overkill here.

## Consequences
A few more files, but each is small. Services can be tested and reused without HTTP.
