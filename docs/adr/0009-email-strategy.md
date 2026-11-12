# ADR-0009: Email strategy

- **Status:** Accepted
- **Date:** 2026-11-13

## Context
OTP and confirmation emails are mandatory; the sender must read 'Code-a-Nova' and templates must contain no developer/candidate names.

## Decision
- Nodemailer with SMTP from env (`EMAIL_USER`, `EMAIL_PASS`; Gmail App Password). From header is `"Code-a-Nova" <EMAIL_USER>`, hard-coded name.
- Templates contain no developer names. The **confirmation email includes the participant's own name and team** because the brief requires it; this is participant data, not a candidate/developer name.
- All user input is HTML-escaped in templates.
- OTP email failure -> `502 EMAIL_SEND_FAILED` (user can use resend). Registration email failure does **not** roll back the entry: response has `emailSent: false`. Contact-form email failure is logged; the message is already saved.
- All mail functions live in `emailService.js` and are mocked in tests.

## Alternatives considered
- Transactional API (SendGrid/Resend): better deliverability but the brief mandates Nodemailer.

## Consequences
Gmail limits (~500/day) are fine for a hackathon. The Gmail App Password needs 2-step verification on the account.
