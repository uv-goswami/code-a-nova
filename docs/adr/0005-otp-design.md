# ADR-0005: OTP design

- **Status:** Accepted
- **Date:** 2026-11-13

## Context
The brief requires a custom 6-digit OTP, 10-minute expiry, and invalidation after first use.

## Decision
- Generated with `crypto.randomInt` (CSPRNG), zero padded.
- Stored as **HMAC-SHA256(secret, email:otp)**, never plain text, on the user document (`otpHash`, `otpExpiresAt`, `otpAttempts`, `otpLastSentAt`; all `select: false`).
- Expires after 10 minutes (`OTP_TTL_MINUTES`); cleared on success (single use); issuing a new OTP overwrites the old one.
- Max 5 wrong attempts (`OTP_MAX_ATTEMPTS`) then `429 OTP_ATTEMPTS_EXCEEDED` until a new OTP is requested (6-digit codes are brute-forceable without this).
- Resend cooldown 60 s (`OTP_RESEND_COOLDOWN_SECONDS`). `resend-otp` answers identically for unknown emails (no account enumeration).
- Comparison via `timingSafeEqual`.

## Alternatives considered
- Separate Otp collection with TTL index: cleaner expiry but another collection; only one live OTP per user is needed.
- bcrypt-hashing the OTP: slow and unnecessary for a 10-minute secret; HMAC with a server secret is sufficient.

## Consequences
Unverified accounts are not auto-deleted (possible follow-up: TTL cleanup job). Changing `OTP_SECRET` invalidates outstanding OTPs.
