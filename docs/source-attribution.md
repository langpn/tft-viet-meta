# Source attribution and provenance

The official tier lists use the [live Academy snapshot](../src/lib/data/academy-live.json), which records the season and patch from the default Academy comps page and the hashes of the tier-list responses. The [Set 19 PBE snapshot](../src/lib/data/academy-set19.json) records separate Academy and MetaTFT sources. The [Set 18 manifest](../src/lib/data/meta-manifest.json) describes the learning catalog, tooltip localization, previous coaching and pinned CommunityDragon release. A `null` source hash denotes a historical record whose original response bytes are unavailable.

## Sources

- TFT Academy public pages: <https://tftacademy.com>
- TFT Academy sitemap: <https://tftacademy.com/sitemap.xml>
- Riot Teamfight Tactics developer documentation: <https://developer.riotgames.com/docs/tft>
- Riot Data Dragon: <https://ddragon.leagueoflegends.com>
- CommunityDragon, pinned to the release in the manifest: <https://raw.communitydragon.org>
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

The sync stores a new publication timestamp and source hashes when the output changes. The historical crawler separately classifies changes as `added`, `modified`, `deleted`, or `unchanged`. A failed source, parity, or localization check retains the previously published data.
