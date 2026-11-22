# Parity contract

## TFT Academy content

The crawler records public URLs and raw page snapshots. Content parity is measured against the captured source snapshot, not an invented rewrite. Each page must retain its source URL, retrieval timestamp and content hash.

## Explorer behavior

Explorer parity compares the production normalizer with expected results from [recorded source samples](../tests/fixtures/explorer-parity.json). The samples cover all five ranks for patches `16212` and `16230`, selected trait rows and two Draven filters, one with Deathblade. An additional filter needs its own fixture for a parity claim. The legacy connector reports `UNVERIFIED` when it only captures a response.

## Vietnamese data

Riot's `vi_VN` locale takes precedence when available. English data remains available as a fallback. MetaTFT can fill gaps in the locale overlay. Coaching translations match the guide ID, stage and original text, and new reviewed translations must preserve numeric values.

## Fail-closed behavior

The sync exits with code `2` and retains the previously published files when:

- A source schema changes.
- A required catalog is missing.
- A coaching translation is missing or a newly supplied translation changes numeric values.
- Explorer parity fixtures fail.
- A source page cannot be fetched.

No default value may hide missing evidence.
