# ADR-0006: Team size semantics

- **Status:** Accepted (needs owner confirmation)
- **Date:** 2026-11-13

## Context
The brief says Team Size 1 = solo with no member boxes, but also that size 3 renders 3 member boxes. Those two statements only agree if the registrant is **not** counted among the boxes for size 1, which contradicts size 3 giving 3 boxes.

## Decision
**`teamSize` includes the registrant (team lead).** `teamMembers` holds the *other* people, so `teamMembers.length === teamSize - 1` (size 1 = none, size 5 = 4). Member emails must be unique and differ from the lead's. The frontend renders `teamSize - 1` boxes.

## Alternatives considered
- teamMembers.length === teamSize (lead plus N more): contradicts the 'size 1 = solo' rule.

## Consequences
**Open question for the project owner:** if the evaluators expect 'size 3 = 3 boxes', change one rule in `hackathonService.assertBusinessRules`, the `teamMembers` description in `openapi.yaml` and the matching tests. Nothing else depends on it.
