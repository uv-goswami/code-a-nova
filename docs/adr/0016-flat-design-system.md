# ADR-0016: Flat, Unstop-inspired design system (no gradients)

- **Status:** Accepted
- **Date:** 2026-11-13

## Context
The product owner asked for a theme similar to Unstop and **no gradient colours**. Unstop's look is a white canvas, a deep blue primary, light grey sections, bordered rounded cards with subtle shadows, pill tags and yellow highlights for rewards.

## Decision
- **Flat colours only.** No `linear/radial/conic-gradient` anywhere. Section separation uses solid fills (white, `surface` grey, `primary-50` tint, solid `primary` navy for the footer and the call-to-action band).
- Tokens (in `src/index.css` `@theme`): `primary #1C4980` (+ dark, 50, 100), `accent #FFB800` (+ 50), `ink #1A2233`, `muted #5B6577`, `line #E3E8EF`, `surface #F5F7FA`, `success`, `danger`. Type: Inter. Corner radius 8 px controls, 12 px cards, one soft card shadow.
- Primary actions are solid blue; secondary actions are outlined blue; yellow is reserved for emphasis (Register CTA on navy, "Registrations open" pill, prize highlight, check marks).
- Accessible by default: visible focus ring, labelled fields with `aria-invalid`, skip link, semantic headings and landmarks, 44 px tall controls, no horizontal scroll at 390 px.
- A class-merge helper (`tailwind-merge`) makes component overrides deterministic.

## Alternatives considered
- Tinted hero gradients: rejected by the owner.
- Dark mode: out of scope for v1.

## Consequences
- Tailwind v4 emits unused `--tw-gradient-*` custom-property declarations in the compiled CSS. They are never applied, so the rendered UI has no gradients. Do not add `bg-gradient-*` utilities; a code review rule, not a lint rule (yet).
- Brand colours are approximations of the Unstop look, not an exact copy of their assets: change the tokens to re-theme the whole app.
