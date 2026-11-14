# Architecture Decision Records

One short file per significant decision. **Add a new ADR whenever we make or change a decision that
would be expensive to reverse.** Never edit an accepted ADR's decision: write a new one that
*supersedes* it and update the old one's status.

| # | Title | Status |
|---|-------|--------|
| [0001](0001-monorepo-structure.md) | Monorepo with /client and /server | Accepted |
| [0002](0002-layered-backend-architecture.md) | Layered backend architecture | Accepted |
| [0003](0003-openapi-single-source-of-truth.md) | OpenAPI as the single source of truth | Accepted |
| [0004](0004-authentication-jwt-bcrypt.md) | Authentication: JWT bearer + bcrypt | Accepted |
| [0005](0005-otp-design.md) | OTP design | Accepted |
| [0006](0006-team-size-semantics.md) | Team size semantics | Accepted (needs owner confirmation) |
| [0007](0007-error-envelope.md) | Uniform response and error envelope | Accepted |
| [0008](0008-public-vs-protected-endpoints.md) | Public vs protected endpoints | Accepted |
| [0009](0009-email-strategy.md) | Email strategy | Accepted |
| [0010](0010-testing-strategy.md) | Testing strategy | Accepted |
| [0011](0011-pin-mongoose-8.md) | Pin Mongoose 8.x | Accepted |
| [0012](0012-adopt-typescript.md) | Adopt TypeScript for the backend | Accepted |
| [0013](0013-zod-only-where-openapi-cannot-validate.md) | Zod only where OpenAPI cannot validate at runtime | Accepted |
| [0014](0014-tests-never-read-dotenv.md) | Tests never read `.env` | Accepted |
| [0015](0015-client-architecture.md) | Client architecture (Vite, React 19, TypeScript, Tailwind v4) | Accepted |
| [0016](0016-flat-design-system.md) | Flat, Unstop-inspired design system (no gradients) | Accepted |
| [0017](0017-client-validation-with-zod.md) | Client-side validation with Zod; the server stays the authority | Accepted |

Template: [template.md](template.md)
