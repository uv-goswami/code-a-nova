# ADR-0001: Monorepo with /client and /server

- **Status:** Accepted
- **Date:** 2026-11-13

## Context
The brief requires one public GitHub repo with `/client` (React) and `/server` (Express). Frontend deploys to Vercel/Netlify, backend to Render/Railway.

## Decision
Single Git repo, two independent npm projects (no workspaces tooling). `docs/` lives at the repo root. Each project has its own `package.json`, `.env.example` and deploy root directory.

## Alternatives considered
- npm/pnpm workspaces: extra tooling for no benefit at this size.
- Two repos: violates the brief and splits history.

## Consequences
One PR can change API + UI together. Deploy platforms must be told the root directory (`server` or `client`). The OpenAPI file lives inside `server/` so the backend deploy is self-contained.
