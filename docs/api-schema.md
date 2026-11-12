# API Schema

**Contract (source of truth):** [`server/openapi/openapi.yaml`](../server/openapi/openapi.yaml) (OpenAPI 3.0.3).
When the server runs: Swagger UI at `http://localhost:5000/api/docs`, raw JSON at `/api/openapi.json`.
This page is a readable summary; if it ever disagrees with the YAML, the YAML wins.

Base path: `/api`  |  Auth: `Authorization: Bearer <JWT>`  |  Bodies: `application/json`

## Envelope (ADR-0007)
```jsonc
// success
{ "success": true, "data": { } }
// failure
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [{ "field": "mobile", "message": "must match pattern" }] } }
```

## Endpoints
| Method | Path | Auth | Purpose | Success | Main errors |
|---|---|---|---|---|---|
| GET | `/health` | - | Liveness | 200 | |
| GET | `/meta/options` | - | Dropdown values | 200 | |
| POST | `/auth/signup` | - | Create unverified user + send OTP | 201 | 400 `VALIDATION_ERROR` `PASSWORD_MISMATCH`, 409 `EMAIL_ALREADY_REGISTERED`, 429 `OTP_COOLDOWN`, 502 `EMAIL_SEND_FAILED` |
| POST | `/auth/verify-otp` | - | Verify OTP, activate account | 200 | 400 `INVALID_OTP` `OTP_EXPIRED`, 409 `ALREADY_VERIFIED`, 429 `OTP_ATTEMPTS_EXCEEDED` |
| POST | `/auth/resend-otp` | - | New OTP (old one invalidated) | 200 | 429 `OTP_COOLDOWN`, 502 |
| POST | `/auth/login` | - | Get JWT | 200 `{token,user}` | 401 `INVALID_CREDENTIALS`, 403 `EMAIL_NOT_VERIFIED` |
| GET | `/user/me` | JWT | Profile | 200 | 401 `UNAUTHORIZED` `TOKEN_EXPIRED` |
| PUT | `/user/update` | JWT | Update `fullName` | 200 | 400 |
| POST | `/hackathon/register` | JWT | Submit registration | 201 `{registration,emailSent}` | 400, 409 `ALREADY_REGISTERED` |
| GET | `/hackathon/my-entry` | JWT | My registration | 200 | 404 `REGISTRATION_NOT_FOUND` |
| DELETE | `/hackathon/{id}` | JWT (owner/admin) | Delete registration | 200 | 403 `FORBIDDEN`, 404 |
| POST | `/contact` | - | Contact form | 201 | 400, 429 |

Brief-to-API mapping: the brief's 8 endpoints are all present; `resend-otp`, `meta/options`, `contact` and `health` are additions (ADR-0008).

## Request field rules
| Field | Rule |
|---|---|
| `fullName`, member `name` | 3-60 chars, letters and spaces only |
| `email` | valid email, max 254, case-insensitive |
| `password` | 8-72 chars, >= 1 letter and >= 1 digit; `confirmPassword` must match |
| `otp` | exactly 6 digits |
| `mobile` | `^[6-9]\d{9}$` |
| `college/course/branch/yearOfStudy/domain` | must be one of `GET /meta/options` |
| `projectName` | 5-100 chars |
| `pptLink` | https URL on Drive/Docs/OneDrive/SharePoint |
| `prototypeLink` | any http(s) URL |
| `demoVideoLink` | optional, YouTube or Drive |
| `teamSize` | integer 1-5 (includes you) |
| `teamMembers` | exactly `teamSize - 1` items, unique emails, none equal to yours |
| Unknown properties | rejected (`additionalProperties: false`) |

## Frontend flow cheat-sheet
1. `POST /auth/signup` -> go to OTP screen (keep `email` in state)
2. `POST /auth/verify-otp` -> go to Login. "Resend" -> `POST /auth/resend-otp` (60 s cooldown)
3. `POST /auth/login` -> store `token`, go to Dashboard
4. Dashboard: `GET /user/me` + `GET /hackathon/my-entry` (404 `REGISTRATION_NOT_FOUND` => show **Register Now**)
5. `POST /hackathon/register` -> success screen (if `emailSent=false`, tell the user the email is delayed)
6. Logout: delete token locally
