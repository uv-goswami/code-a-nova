# ADR-0012: Adopt TypeScript for the backend

- **Status:** Accepted
- **Date:** 2026-11-13

## Context
The first backend version was plain JavaScript. The brief only requires Node/Express, so TypeScript is allowed. We want compile-time safety on a codebase with several layers (models, services, controllers) and on the API contract that the React client will consume.

## Decision
- The server is written in **TypeScript 5 (`strict`, plus `noUnusedLocals/Parameters`)**, compiled to CommonJS.
- `npm run dev` runs `tsx watch src/server.ts`; `npm run build` runs `tsc -p tsconfig.build.json` into `dist/`; `npm start` runs `node dist/server.js`; `npm run typecheck` runs `tsc --noEmit` over `src` and `tests`.
- Jest runs the `.ts` files through **ts-jest** (type errors fail the tests).
- The React client will also be TypeScript and will reuse the types generated from `openapi.yaml` (ADR-0013).
- Mongoose 8 ships its own types; `@types/*` packages are dev dependencies.

## Alternatives considered
- Stay on JavaScript: less tooling, but no compile-time checks on service/model contracts.
- Run TypeScript directly in production with `tsx`: simpler deploy, but slower start and ships dev tooling to production.

## Consequences
- Deploys need a build step. On Render use build `npm ci --include=dev && npm run build` (a `NODE_ENV=production` setting would otherwise skip the TypeScript compiler) and start `npm start`.
- Every source file now needs types; the ts-jest transform makes the first test run a little slower.
