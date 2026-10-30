# Source attribution and provenance

This project keeps source metadata with every imported snapshot. The local index must not present unverified data as canonical.

## Sources

- TFT Academy public pages: <https://tftacademy.com>
- TFT Academy sitemap: <https://tftacademy.com/sitemap.xml>
- Riot Teamfight Tactics developer documentation: <https://developer.riotgames.com/docs/tft>
- Riot Data Dragon: <https://ddragon.leagueoflegends.com>
- MetaTFT reference: <https://www.metatft.com>
- tactics.tools Explorer reference: <https://tactics.tools/explorer>

## Source states

| State | Meaning |
| --- | --- |
| `official` | Imported from Riot's published static data or locale endpoint. |
| `source_snapshot` | Raw public page captured with URL, timestamp and SHA-256 hash. |
| `reference_only` | Used to inspect terminology or behavior; not treated as canonical data. |
| `unverified` | A connector or parity fixture is missing; do not present as authoritative. |
| `blocked` | The source could not be fetched or its schema changed. |

## Update rule

Every sync stores a new timestamp and content hash. A source change must be classified as `added`, `modified`, `deleted`, or `unchanged`. A failed parity or localization check blocks publication of the new state and retains the previous state for rollback.
