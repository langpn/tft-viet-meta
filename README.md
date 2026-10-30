# TFT Việt Meta (TFT Academy Việt Nam)

> 🌐 **Website trực tuyến:** [https://tft.langpn.xyz](https://tft.langpn.xyz)  
> Nền tảng cẩm nang meta Đấu Trường Chân Lý (TFT) số 1 Việt Nam. Bảng xếp hạng 73 đội hình meta giám tuyển bởi Dishsoap & Frodan, 123 trang bị, 249 lõi nâng cấp và số liệu tactics.tools live chuyển ngữ tiếng Việt 100%.

## Current status

The repository contains the first vertical slice:

- Snapshot hashing and added/modified/deleted diffing.
- Vietnamese accent-insensitive search.
- Numeric placeholder validation for translations.
- Stable Explorer query hashing and parity comparison.
- Bun HTTP server with Vietnamese home page, search API, Explorer contract and status API.
- Explicit `BLOCKED`/`UNVERIFIED` sync states. The system never invents source data.
- TFT Academy sync scope is intentionally limited to `/tierlist/comps`, `/tierlist/items`, `/tierlist/augments`, and `/learn/new-set`.
- `/tierlist/updates/comps` is monitored as an update trigger; when it changes, the next sync refreshes all three tier-list pages: comps, items, and augments.
- Guides, Study Hall, Academy+, tools, creator pages, policies, historical comp detail pages, and other routes are currently out of scope.

## Run locally

```bash
bun install
bun test
bunx tsc --noEmit
bun run dev
```

Then open http://localhost:3000.

## Sync policy

`sync` and `verify` currently fail closed until source connectors and fixtures are configured. This is intentional: an unverified result must not be presented as canonical TFT data.

```bash
bun run sync
bun run verify
```
