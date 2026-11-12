# ADR-0011: Pin Mongoose 8.x

- **Status:** Accepted
- **Date:** 2026-11-13

## Context
While building, Mongoose 9 (driver 7.x) fails its connection handshake under Jest with the in-memory MongoDB (`Missing required sub-document 'driver' in the client metadata document`), while Mongoose 8.x (driver 6.x) works. Observed in the Linux dev sandbox; not investigated further.

## Decision
Depend on `mongoose@^8` (currently 8.24). Revisit when upgrading; re-run the test-suite on the new major before bumping.

## Alternatives considered
- Mongoose 9: blocked as above.
- Replace Jest: unjustified.

## Consequences
We trade the newest major for a green test suite. Mongoose 8 is a maintained, widely deployed line.
