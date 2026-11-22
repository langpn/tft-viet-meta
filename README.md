# TFT Việt Meta

Cẩm nang Đấu Trường Chân Lý bằng tiếng Việt, gồm bảng xếp hạng đội hình, trang bị, lõi nâng cấp và thống kê Explorer. Trang đang phục vụ bộ dữ liệu Mùa 18, bản 18.5c. [Website](https://tft.langpn.xyz)

## Chạy hệ thống

Dùng Bun 1.4.3 cho cài đặt, đồng bộ và test. Ứng dụng SvelteKit chạy production trên Node.js 22.17 trở lên. Docker và CI dùng Node.js 24.

```bash
bun install --frozen-lockfile
bun run dev
```

Trang phát triển mở tại `http://localhost:3000`. Để kiểm tra bản production, chạy `bun run build` rồi `bun run start`.

```bash
bun run verify
bun test
bun run typecheck
bun run build
bunx playwright install chromium
bunx playwright test
```

Trên máy đã cài Google Chrome, có thể dùng `TFT_PLAYWRIGHT_CHANNEL=chrome bunx playwright test`.

## Phát hành trên macOS

Chạy với tài khoản đang có phiên macOS, Node.js 24 và Bun 1.4.3 trong `PATH`. Mỗi lần phát hành lấy mã từ một commit, kiểm tra và chạy thử tại `127.0.0.1:4382`. Sau khi smoke test đạt, lệnh đổi symlink `current`, khởi động lại LaunchAgent `xyz.langpn.tft-viet-meta` và kiểm tra tại `127.0.0.1:4381`. Nếu bước này lỗi, lệnh tự quay về release trước. Tunnel đang dùng thêm ingress `tft.langpn.xyz` trỏ đến cổng `4381`.

```bash
bash scripts/deploy-macos.sh deploy <commit>
node scripts/smoke-production.mjs https://tft.langpn.xyz
bash scripts/deploy-macos.sh rollback <commit-da-phat-hanh>
```

Các bản đã triển khai nằm trong `~/Library/Application Support/tft-viet-meta/releases/`. Bản Mùa 18 được giữ ở đây để có thể quay lui nguyên trạng khi triển khai mùa mới. Nếu quy trình bị dừng bất thường, xác nhận không còn lệnh deploy chạy trước khi xử lý `.deploy-lock` hoặc `.next-release` còn sót trong cùng thư mục.

## Đồng bộ dữ liệu

`bun run sync` chạy từ thư mục gốc. Lệnh tải các nguồn, dựng JSON và tooltip trong thư mục tạm, áp dụng bản dịch đã duyệt, kiểm tra fixture Explorer rồi cập nhật bộ dữ liệu cùng manifest. CI chạy lại verify, test, kiểm tra kiểu và build trước khi đẩy cập nhật. `bun run verify` có thể chạy offline. Lệnh đối chiếu hash các tệp đã phát hành và các truy vấn Explorer có fixture.

Nếu nguồn lệch mùa, thiếu dữ liệu hoặc thiếu bản dịch coaching, lệnh thoát với mã `2` và giữ bộ dữ liệu đã phát hành. Hiện trang giới thiệu mùa của TFT Academy đã chuyển sang Set 19 nên nguồn này chặn đồng bộ Set 18. [Manifest](src/lib/data/meta-manifest.json)

`bun run stage:set19` tạo ứng viên Mùa 19 ở `data/snapshots/set-19/academy-preview.json`, kèm URL và SHA-256 của nguồn Academy. Bộ ứng viên chỉ dùng để rà dữ liệu. Để chuyển mùa trên website, cần catalog CommunityDragon có `TFTSet19` và locale `vi_vn`, patch Explorer cùng mùa có fixture đối chiếu, và bản dịch đã duyệt cho coaching. Các mô tả chưa có bản tiếng Việt cần hiển thị rõ ngôn ngữ nguồn. Giữ release Mùa 18 và kiểm tra các liên kết cũ trước khi chuyển mặc định. [Bản nháp coaching Mùa 19](data/translations/set-19-coaching-draft.vi.json)

Nếu tiến trình cập nhật bị dừng đột ngột, kiểm tra PID trong `src/lib/data/.meta-publish-lock/owner.json` và chạy `bun run verify`. Nếu hash bị lệch, dùng các bản `previous` trong `.meta-stage-*` để khôi phục bộ dữ liệu theo manifest trước khi xác minh lại. Chỉ xóa khóa khi tiến trình đã dừng và bộ dữ liệu đã được xác minh.

Để bổ sung coaching đã duyệt, dùng `bun run sync --coaching path/to/translations.json`. Tệp JSON là một mảng có `id` đội hình, `tips` gồm các trường `stage`, `tip_en`, `tip`, và hai trường `augmentsTip_en`, `augmentsTip`. Các chuỗi tiếng Anh phải khớp với nguồn. Bản dịch mới được kiểm tra số liệu trước khi dùng. Nếu chỉ bổ sung mẹo theo giai đoạn, để hai trường dành cho lõi là chuỗi rỗng.

`scripts/build-tooltip-db.ts`, `scripts/build-official-vi.ts` và `scripts/apply-official-vi.ts` nhận đường dẫn thư mục staging. Lệnh sync dùng overlay tiếng Việt đã kiểm tra hash trong manifest. Script tạo overlay cho phép chuẩn bị bản mới để rà trước khi cập nhật dữ liệu nguồn. [Nguồn và xuất xứ](docs/source-attribution.md) · [Quy tắc đối chiếu](docs/parity-contract.md)
