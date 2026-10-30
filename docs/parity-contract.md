# Parity contract

## TFT Academy content

The crawler records public URLs and raw page snapshots. Content parity is measured against the captured source snapshot, not an invented rewrite. Each page must retain its source URL, retrieval timestamp and content hash.

## Explorer behavior

Explorer parity requires a fixture containing the query input, source snapshot, normalized result and local result. A query is `PASS` only when the normalized result matches. Missing source output is `UNVERIFIED`; a mismatch is `FAIL`.

## Vietnamese data

Riot's `vi_VN` locale is the canonical localization source when available. English data remains available as a fallback/reference. MetaTFT and tactics.tools may provide search aliases or terminology references, but cannot silently override a verified Riot locale value.

## Fail-closed behavior

The sync process must stop or publish a partial/unverified report when:

- A source schema changes.
- A required catalog is missing.
- A translation is missing or changes numeric placeholders.
- Explorer parity fixtures fail.
- A source page cannot be fetched.

No default value may hide missing evidence.
