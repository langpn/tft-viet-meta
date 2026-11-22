# TFT Việt Meta

Cẩm nang Đấu Trường Chân Lý bằng tiếng Việt. Đội hình, trang bị, lõi và thông tin mùa mặc định theo Mùa 19 Prismatic Tour của TFT Academy. Explorer hiện hiển thị thống kê Mùa 18 của tactics.tools. [Website](https://tft.langpn.xyz)

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

Các bản đã triển khai nằm trong `~/Library/Application Support/tft-viet-meta/releases/`. Bản Mùa 18 được giữ ở đây để có thể quay lui nguyên trạng khi triển khai mùa mới. Mỗi release dùng smoke test đi kèm với chính commit đó. Nếu quy trình bị dừng bất thường, xác nhận không còn lệnh deploy chạy trước khi xử lý `.deploy-lock` hoặc thư mục `.switch.*` còn sót.

## Đồng bộ dữ liệu

`bun run sync:academy` lấy đội hình, trang bị, lõi và cẩm nang Mùa 19 từ TFT Academy, ghép bản địa hóa MetaTFT theo đúng ID rồi kiểm tra dữ liệu trước khi ghi. Mô tả chưa có bản dịch được hiển thị theo nguồn tiếng Anh. Các bảng hạng dùng bản có dữ liệu mới nhất của từng nhóm mà Academy cung cấp. Snapshot ghi thời điểm lấy và SHA-256 của các nguồn. CI chạy verify, test, kiểm tra kiểu, build và Playwright trước khi đẩy cập nhật lên GitHub. [Snapshot Mùa 19](src/lib/data/academy-set19.json)

`bun run verify` chạy offline và đối chiếu cấu trúc Mùa 19, hash của dữ liệu lưu trữ và các truy vấn Explorer có fixture. Dùng `?set=18` trên các trang nội dung để xem dữ liệu lưu trữ.

`bun run stage:set19` tải dữ liệu gốc cho việc đối chiếu vào `data/snapshots/set-19/academy-preview.json`. Explorer cần có patch Mùa 19 và fixture đối chiếu riêng trước khi chuyển thống kê sang mùa mới. [Bản nháp coaching Mùa 19](data/translations/set-19-coaching-draft.vi.json)

Nếu tiến trình cập nhật bị dừng đột ngột, kiểm tra PID trong `src/lib/data/.meta-publish-lock/owner.json` và chạy `bun run verify`. Nếu hash bị lệch, dùng các bản `previous` trong `.meta-stage-*` để khôi phục bộ dữ liệu theo manifest trước khi xác minh lại. Chỉ xóa khóa khi tiến trình đã dừng và bộ dữ liệu đã được xác minh.

`bun run sync` là quy trình lưu trữ Mùa 18. Lệnh giữ nguyên dữ liệu đã phát hành khi nguồn trả mùa khác hoặc thiếu bản dịch coaching. [Manifest Mùa 18](src/lib/data/meta-manifest.json)

`scripts/build-tooltip-db.ts`, `scripts/build-official-vi.ts` và `scripts/apply-official-vi.ts` nhận đường dẫn thư mục staging. Lệnh sync dùng overlay tiếng Việt đã kiểm tra hash trong manifest. Script tạo overlay cho phép chuẩn bị bản mới để rà trước khi cập nhật dữ liệu nguồn. [Nguồn và xuất xứ](docs/source-attribution.md) · [Quy tắc đối chiếu](docs/parity-contract.md)
