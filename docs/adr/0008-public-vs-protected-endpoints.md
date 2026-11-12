# ADR-0008: Public vs protected endpoints

- **Status:** Accepted
- **Date:** 2026-11-13

## Context
The brief says all routes except Home, Login and Signup are protected, but OTP verification must happen before login, and the Contact page is in the public navbar.

## Decision
Public: `/health`, `/meta/options`, `/auth/*` (signup, verify-otp, resend-otp, login) and `POST /contact` (rate limited to 5/hour/IP). Everything under `/user` and `/hackathon` requires a JWT. The frontend will additionally guard Dashboard, Registration Form and OTP-related screens as the brief describes.

## Alternatives considered
- Protect `/contact`: visitors without accounts could not reach the team.

## Consequences
Auth and contact endpoints are rate limited (see `rateLimiters.js`). Treat this ADR as the explicit exception list to the brief's rule.
