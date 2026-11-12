# ADR-0004: Authentication: JWT bearer + bcrypt

- **Status:** Accepted
- **Date:** 2026-11-13

## Context
The brief allows JWT in localStorage or an httpOnly cookie. Frontend (Vercel) and API (Render) are on different sites, so cookies need `SameSite=None; Secure` plus CORS credentials plus CSRF handling.

## Decision
- Stateless JWT (HS256, 1 day, payload = `sub` + `role`) sent as `Authorization: Bearer <token>`; frontend stores it in localStorage.
- Passwords hashed with **bcrypt** (native `bcrypt` package, cost 12). Passwords capped at 72 chars (bcrypt's input limit).
- The guard re-loads the user on every request, so deleted/unverified users lose access immediately.
- Login returns the same `401 INVALID_CREDENTIALS` for unknown email and wrong password and runs a dummy bcrypt compare to equalise timing.
- Roles: `participant` (default) and `admin` (emails listed in `ADMIN_EMAILS` at signup).

## Alternatives considered
- httpOnly cookie: safer against XSS but adds cross-site cookie and CSRF complexity for this deployment.
- `bcryptjs`: no native build but ~3x slower.

## Consequences
Tokens in localStorage are readable by injected scripts, so the frontend must avoid `dangerouslySetInnerHTML` and escape user content. No server-side logout/revocation: logout just deletes the token (short expiry limits exposure). Revisit with refresh tokens if needed.
