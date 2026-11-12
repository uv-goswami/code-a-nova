# ADR-0010: Testing strategy

- **Status:** Accepted (amended by ADR-0014: tests never read .env)
- **Date:** 2026-11-13

## Context
We need fast, deterministic tests that prove each flow end to end, without sending real mail.

## Decision
Jest + Supertest against the real Express app (`src/app.js`) with **mongodb-memory-server** (real MongoDB behaviour: unique indexes, select:false, duplicate keys). `emailService` is `jest.mock`ed; tests read the OTP from the mock's call arguments. `BCRYPT_ROUNDS=4` and rate limiters are disabled under `NODE_ENV=test`. Pure logic (OTP, link validator) has plain unit tests. Run with `--runInBand`.

## Alternatives considered
- Mock Mongoose: fast but proves little.
- Shared dev database: flaky and slow.

## Consequences
First run downloads a mongod binary (~100 MB, cached). If your network blocks it, set `MONGOMS_SYSTEM_BINARY` to a local mongod.
