# ADR-0015: Client architecture (Vite, React 19, TypeScript, Tailwind v4)

- **Status:** Accepted
- **Date:** 2026-11-13

## Context
The brief asks for React.js with Tailwind CSS or Material UI, responsive on mobile, tablet and desktop, a Vercel/Netlify deployment, and protected routes. We chose TypeScript for the whole codebase (ADR-0012) and want the client to be impossible to drift from the API contract.

## Decision
- **Vite + React 19 + TypeScript (strict) + React Router 7**, **Tailwind CSS v4** (via `@tailwindcss/vite`, tokens in `src/index.css`), small hand-built UI primitives (`src/components/ui`) plus `lucide-react` icons and a self-hosted Inter font. No component library, so the visual style stays fully ours (ADR-0016).
- **API types are generated** from `server/openapi/openapi.yaml` with `openapi-typescript` (`npm run gen:types` -> `src/types/openapi.d.ts`), named in `src/types/api.ts`. One typed function per endpoint in `src/api/endpoints.ts` on top of a tiny `fetch` wrapper (`src/api/client.ts`) that unwraps the `{ success, data | error }` envelope into a typed `ApiRequestError`.
- **Auth:** the JWT is kept in `localStorage` (ADR-0004), sent as a Bearer header. `AuthContext` restores the session via `GET /user/me`; a 401 on a protected call clears the session. `ProtectedRoute` guards Dashboard and Registration; `PublicOnlyRoute` keeps logged-in users off Login/Signup. Clicking Logout goes to Home; an expired session goes to Login (and remembers the page).
- **State:** React state + context only (no Redux/React Query): the app has two data sources (user, one registration).
- **Forms:** `react-hook-form` + Zod resolver (ADR-0017). Server field errors from `details[]` are placed under the matching input.
- **Routing/perf:** pages other than Home are lazy-loaded chunks. Dev uses a Vite proxy (`/api` -> `localhost:5000`) so no CORS is needed locally; production sets `VITE_API_URL`.
- **Deploy:** `vercel.json` and `public/_redirects` rewrite every path to `index.html` so deep links and refreshes work on Vercel and Netlify.

## Alternatives considered
- Material UI: faster to assemble, but the requested Unstop-like flat look would need heavy theme overrides.
- Next.js: unnecessary server features; the brief wants a React SPA plus a separate API.
- React Query: nice, but adds a dependency for two simple reads.

## Consequences
- After changing `openapi.yaml`, run `npm run gen:types` in both `server` and `client` and commit the results; `npm run typecheck` then shows every call site that needs updating.
- Tokens in `localStorage` are readable by injected scripts: never use `dangerouslySetInnerHTML`, and escape user content (React does by default).
