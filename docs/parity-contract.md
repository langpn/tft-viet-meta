# Parity contract

## TFT Academy content

The crawler records public URLs and raw page snapshots. Content parity is measured against the captured source snapshot, not an invented rewrite. Each page must retain its source URL, retrieval timestamp and content hash.

## Explorer behavior

Explorer parity compares the production normalizer with expected results from [recorded source samples](../tests/fixtures/explorer-parity.json). The samples cover all five ranks for patches `16212` and `16230`, selected trait rows and two Draven filters, one with Deathblade. An additional filter needs its own fixture for a parity claim. The legacy connector reports `UNVERIFIED` when it only captures a response.

## Vietnamese data

The current Set 19 content uses TFT Academy records and joins the MetaTFT Vietnamese catalog on exact entity IDs. Descriptions with unresolved placeholders or numeric values that differ from Academy use the Academy English text. The archived Set 18 pipeline prioritizes Riot's `vi_VN` data. Reviewed coaching translations match the guide ID, stage and original text and preserve numeric values.

## Fail-closed behavior

The sync exits with code `2` and retains the previously published files when:

- A source schema changes.
- A required catalog is missing.
- The Set 18 archive sync detects missing coaching translations or changes to numeric values in a new translation.
- Explorer parity fixtures fail.
- A source page cannot be fetched.

No default value may hide missing evidence.
